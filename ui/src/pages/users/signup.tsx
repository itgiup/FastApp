import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/users/AuthContext";
import { Flex, Typography } from "antd";
import { useEffect } from "react";
import Signup from "../../components/users/Signup";

const { Title } = Typography


export default function SignupPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn} = useAuth();

    useEffect(() => {
        if (isLoggedIn)
            navigate("/user/me")
    }, [isLoggedIn])

    return (<Flex vertical align="center">
        <Signup />
    </Flex>);
}
