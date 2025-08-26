import type { Dayjs } from "dayjs";

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

export interface UpdateUserInput {
    email?: string
}
