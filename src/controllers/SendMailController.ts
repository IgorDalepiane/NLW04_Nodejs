import { Request, Response } from "express";
import { resolve } from "path";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(
            SurveysUsersRepository
        );
        //User exists?
        const user = await usersRepository.findOne({ email });

        if (!user) {
            return response.status(400).json({
                error: "User dos not exists!",
            });
        }

        //Survey exists?
        const survey = await surveysRepository.findOne({
            id: survey_id,
        });

        //Error
        if (!survey) {
            throw new AppError("Survey dos not exists!");
        }

        //Path to handlebars file
        const npsPath = resolve(
            __dirname,
            "..",
            "views",
            "emails",
            "npsMail.hbs"
        );

        //User is already linked to this survey?
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: { user_id: user.id, survey_id: survey.id },
            relations: ["user", "survey"],
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL,
        };

        if (surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id;
            await SendMailService.execute(
                email,
                survey.title,
                variables,
                npsPath
            );
            return response.json(surveyUserAlreadyExists);
        }

        //Save on SurveyUser
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id,
        });
        await surveysUsersRepository.save(surveyUser);

        //Send email
        variables.id = surveyUser.id;

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }
}

export { SendMailController };
