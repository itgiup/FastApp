import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { UserErrors } from "../../schemas/user";
import { UserProfile } from "./UserProfile";
import { LoginForm } from "./LoginForm";
import type { UserClient } from "../../services/user";

interface Props {
    client: UserClient
}


export const User: FC<Props> = ({ client }) => {
    const { t } = useTranslation();

    if (!client) return t(UserErrors.UserClientHasNotInitiated);

    if (client.isAuthenticated()) {
        return <UserProfile client={client} />
    }
    return <LoginForm client={client} />
}