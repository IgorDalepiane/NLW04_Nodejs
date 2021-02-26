import { Request, Response } from "express";
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
        const userAlreadyExists = await usersRepository.findOne({ email });

        if (!userAlreadyExists) {
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

        //Save on SurveyUser
        const surveyUser = surveysUsersRepository.create({
            user_id: userAlreadyExists.id,
            survey_id,
        });
        await surveysUsersRepository.save(surveyUser);

        //Send email
        await SendMailService.execute(email, survey.title, survey.description);

        return response.json(surveyUser);
    }
}

export { SendMailController };
