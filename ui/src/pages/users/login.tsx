/**
 * Đây là trang kết hợp LoginForm với useAuth, xử lý submit và chuyển hướng:
 */

import { useTranslation } from "react-i18next";
import { LoginForm } from "../../components/users/LoginForm";
import { services } from "../../services";
import { UserErrors } from "../../schemas/user";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Alert, Flex } from "antd";


export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        if (services.user && services.user.isAuthenticated()) {
            navigate("/user/me");
        }
    }, [navigate]);

    if (!services.user)
        return <Alert message={t(UserErrors.UserClientHasNotInitiated)} type="error" />;

    return (
        <Flex vertical>
            <h1>Đăng nhập</h1>
            <LoginForm client={services.user} />
        </Flex>
    );
}
