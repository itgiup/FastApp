import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/users/AuthContext";
import { Flex, Typography } from "antd";
import { UserProfile } from "../../components/users/UserProfile";
import { useEffect } from "react";

const { Title } = Typography


export default function MePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn} = useAuth();

    useEffect(() => {
        if (!isLoggedIn)
            navigate("/user/login")
    }, [isLoggedIn])

    return (<Flex vertical align="center">
        <Title level={3}>{t("user.profile")}</Title>
        <UserProfile />
    </Flex>);
}
