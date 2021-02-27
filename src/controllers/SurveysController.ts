import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";

class SurveysController {
    async create(request: Request, response: Response) {
        const { title, description } = request.body;
        //Connection
        const surveysRepository = getCustomRepository(SurveysRepository);
        //Creation
        const survey = surveysRepository.create({
            title,
            description,
        });
        //Saving
        await surveysRepository.save(survey);
        //Returning
        return response.status(201).json(survey);
    }

    async show(request: Request, response: Response) {
        //Connection
        const surveysRepository = getCustomRepository(SurveysRepository);
        //Searching
        const all = await surveysRepository.find();
        //Returning
        return response.json(all);
    }
}

export { SurveysController };
