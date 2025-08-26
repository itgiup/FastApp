/**
 * Đây là trang kết hợp LoginForm với useAuth, xử lý submit và chuyển hướng:
 */

import { useTranslation } from "react-i18next";
import { LoginForm } from "../../components/users/LoginForm";
import { Typography, Flex } from "antd";
import { useAuth } from "../../components/users/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const { Title } = Typography

export default function LoginPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth()

    useEffect(() => {
        if (isLoggedIn)
            navigate("/user/me")
    }, [isLoggedIn])

    return (
        <Flex vertical align="center">
            <Title level={3}>{t("Login")} </Title>
            <LoginForm />
        </Flex>
    );
}
