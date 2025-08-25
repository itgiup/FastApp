/**
 * Đây là trang kết hợp LoginForm với useAuth, xử lý submit và chuyển hướng:
 */

import { useTranslation } from "react-i18next";
import { services } from "../../services";
import { UserErrors } from "../../schemas/user";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function UserPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        if (services.user) {
            const isAuthenticated = services.user.isAuthenticated()
            if (isAuthenticated)
                navigate("/user/me");
            else
                navigate('/user/login');
        }
    }, [navigate]);

    if (!services.user) return t(UserErrors.UserClientHasNotInitiated);

    return '...'
}
