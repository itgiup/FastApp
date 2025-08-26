/**
 * Đây là trang kết hợp LoginForm với useAuth, xử lý submit và chuyển hướng:
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/users/AuthContext";
import { UserErrors } from "../../schemas/user";
import { useTranslation } from "react-i18next";
import { Alert } from "antd";
import {
    LoadingOutlined,
} from '@ant-design/icons';
import { useEffect } from "react";

export default function UserPage() {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const { isLoggedIn, userClient } = useAuth();

    if (!userClient) {
        return <Alert type="warning" message={t(UserErrors.UserClientHasNotInitiated)} showIcon />;
    }

    useEffect(() => {
        if (isLoggedIn)
            navigate("/user/me")
        else
            navigate('/user/login');
    }, [isLoggedIn])

    return <LoadingOutlined spin />
}
