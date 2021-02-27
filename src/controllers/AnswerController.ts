import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

class AnswerController {
    /**
     * http://localhost:3333/answers/1?u=e6b2efd7-66c4-4e38-922a-00ee3018ab69
     *
     * Route Params => Parâmetros que compõem a rota
     * routes.get("/answers/:value")
     *
     * Query Params => Busca,Paginação, não obrigatórios
     */
    async execute(request: Request, response: Response) {
        const { value } = request.params;
        const { u } = request.query;

        const surveysUsersRepository = getCustomRepository(
            SurveysUsersRepository
        );

        const surveyUser = await surveysUsersRepository.findOne({
            id: String(u),
        });

        if (!surveyUser) {
            throw new AppError("Survey User does not exists!");
        }

        surveyUser.value = Number(value);

        await surveysUsersRepository.save(surveyUser);

        return response.json(surveyUser);
    }
}

export { AnswerController };
