export type LoginResponse = {
    login: {
        accessToken: string;
    };
};

export type LoginVariables = {
    username: string;
    password: string;
};
