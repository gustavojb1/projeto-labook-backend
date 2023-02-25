import { Request, Response } from "express";
import { UsersBusiness } from "../business/UsersBusiness";
import { LoginInput, SignupInput, UsersDTO } from "../dtos/usersDTO";

export class UsersController {
  constructor(
    private userBusiness: UsersBusiness,
    private usersDTO: UsersDTO
  ) {}

  public getUsers = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;

      const input = this.usersDTO.getUsers(token);
      const output = await this.userBusiness.getUsers(input);
  
      res.status(200).send(output);
      
    } catch (error) {
      console.log(error);

      if (req.statusCode === 200) {
        res.status(500);
      }

      if (error instanceof Error) {
        res.send(error.message);
      } else {
        res.send("Erro inesperado");
      }
    }




  };

  public login = async (req: Request, res: Response) => {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const input = this.usersDTO.loginPostInput(email, password);
      const output = await this.userBusiness.login(input);

      res.status(200).send(output);
    } catch (error) {
      console.log(error);

      if (req.statusCode === 200) {
        res.status(500);
      }

      if (error instanceof Error) {
        res.send(error.message);
      } else {
        res.send("Erro inesperado");
      }
    }
  };

  public signup = async (req: Request, res: Response) => {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;


      const input = this.usersDTO.signupInput(name, email, password);

      const output = await this.userBusiness.signup(input);

      res.status(201).send(output);
    } catch (error) {
      console.log(error);

      if (req.statusCode === 200) {
        res.status(500);
      }

      if (error instanceof Error) {
        res.send(error.message);
      } else {
        res.send("Erro inesperado");
      }
    }
  };
}
