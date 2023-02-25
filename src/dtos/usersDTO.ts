import { User } from "../models/User"
import { USER_ROLES } from "../types"


export interface SignupInput {
    name: unknown,
    email: unknown,
    password: unknown
}

export interface SignupOutput {
    message: string,
    token: string
}

export interface LoginInput {
    email: unknown,
    password: unknown
}

export interface LoginOutput {
    message: string,
    token: string
}

export interface GetUsersInput {
    token: string
}
export interface GetUsersOutputDTO {
    id : string
    name : string
    email: string
    role : USER_ROLES
}

export class UsersDTO {
    getUsers = (token: unknown):GetUsersInput=>{
        if (typeof token !== "string"){
            throw new Error ("Token inválido");
        }

        const result : GetUsersInput = {
            token
        }

        return result;
    }

    getUsersOutput = (user: User ):GetUsersOutputDTO=>{


        const result : GetUsersOutputDTO = {
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail(),
            role: user.getRole(),
        }
        
        return result;
    }

    loginPostInput = (email: unknown, password:unknown):LoginInput=>{
        if (typeof email !== "string"){
            throw new Error("'email' deve ser uma string");
        }

        if (typeof password !== "string"){
            throw new Error("'password' deve ser uma string");
        }

        const result: LoginInput = {
            email,
            password
        }

        return result
    }

    signupInput = (name : unknown, email: unknown, password:unknown):SignupInput=>{
        if (typeof name !== "string"){
            throw new Error("'name' deve ser uma string");
        }
        if (typeof email !== "string"){
            throw new Error("'email' deve ser uma string");
        }

        if (typeof password !== "string"){
            throw new Error("'password' deve ser uma string");
        }

        const result: SignupInput = {
            name,
            email,
            password
        }

        return result
    }
}