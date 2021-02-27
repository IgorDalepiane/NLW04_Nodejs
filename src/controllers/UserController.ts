import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import * as yup from "yup";
import { AppError } from "../errors/AppError";

class UserController {
    async create(request: Request, response: Response) {
        const { name, email } = request.body;
        //Validation
        const schema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().email().required(),
        });
        //Error catching
        try {
            await schema.validate(request.body, { abortEarly: false });
        } catch (err) {
            throw new AppError(err);
        }
        //User exists?
        const usersRepository = getCustomRepository(UsersRepository);

        const userAlreadyExists = await usersRepository.findOne({
            email,
        });

        if (userAlreadyExists) {
            throw new AppError("User already exists!");
        }

        //Create user
        const user = usersRepository.create({
            name,
            email,
        });

        //Save user
        await usersRepository.save(user);

        //Return
        return response.status(201).json(user);
    }
}

export { UserController };
