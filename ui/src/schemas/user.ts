import { Dayjs } from "dayjs";
import { z } from 'zod';

export type LoginState = "LOGGED_OUT" | "LOGGED_IN" | "EXPIRED";

export type LoginResponse = {
    login: {
        accessToken: string;
    };
};

export type LoginVariables = {
    username: string;
    password: string;
};


export const UserErrors = {
    UserClientHasNotInitiated: "User client has not initiated"
}

export interface UserType {
    id: string
    username: string
    email: string
    isActive: boolean
    isSuperuser: boolean
    createdAt: Dayjs
    apiKey?: string
}

// export const UserTypeSchema = z.object({
//     id: z.string(),
//     username: z.string(),
//     email: z.email(),
//     isActive: z.boolean(),
//     isSuperuser: z.boolean(),
//     createdAt: z.instanceof(Dayjs),
//     apiKey: z.string().optional(),
// });


export interface UpdateUserInput {
    email?: string
}


export const UpdateUserInputSchema = z.object({
    email: z.email(),
}); 
