import express from "express";
import { UsersBusiness } from "../business/UsersBusiness";
import { UsersController } from "../controller/UsersController";
import { UserDatabase } from "../database/UserDatabase";
import { UsersDTO } from "../dtos/usersDTO";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export const usersRouter = express.Router();

const usersController = new UsersController(
  new UsersBusiness(
    new UserDatabase(),
    new TokenManager(),
    new HashManager(),
    new IdGenerator(),
    new UsersDTO()
  ),
  new UsersDTO()
);

usersRouter.get("/", usersController.getUsers);

usersRouter.post("/signup", usersController.signup);
usersRouter.post("/login", usersController.login);
