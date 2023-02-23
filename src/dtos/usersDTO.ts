

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

export class UsersDTO {
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