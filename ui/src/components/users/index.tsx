import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "antd";

import { UserProfile } from "./UserProfile";
import { LoginForm } from "./LoginForm";
import { useAuth } from "./AuthContext";
import { UserErrors } from "../../schemas/user";

interface Props {
}

export const User: FC<Props> = ({ }) => {
    const { t } = useTranslation();
    const { isLoggedIn, userClient } = useAuth()

    if (!userClient) {
        return <Alert type="warning" message={t(UserErrors.UserClientHasNotInitiated)} showIcon />;
    }

    if (isLoggedIn) {
        return <UserProfile />
    }

    return <LoginForm />
}