import { Request, Response } from "express";
import { resolve } from "path";
import { getCustomRepository } from "typeorm";
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

        if (!survey) {
            return response.status(400).json({
                error: "Survey dos not exists!",
            });
        }

        const npsPath = resolve(
            __dirname,
            "..",
            "views",
            "emails",
            "npsMail.hbs"
        );

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            user_id: user.id,
            link: process.env.URL_MAIL,
        };

        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: [{ user_id: user.id }, { value: null }],
            relations: ["user", "survey"],
        });

        if (surveyUserAlreadyExists) {
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

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }
}

export { SendMailController };
