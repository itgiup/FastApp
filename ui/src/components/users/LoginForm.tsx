import { useState, type FC } from "react";
import { Form, Input, Button, Alert } from "antd";
import { appContext } from "../../services";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

interface Props {
}

export const LoginForm: FC<Props> = ({ }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const { isLoggedIn, login } = useAuth()

    const onFinish = async (values: { username: string; password: string }) => {
        try {
            setLoading(true);
            const token = await login(values.username, values.password);
            if (!token)
                appContext.message?.error(t("Login failed"));
        } catch (err: any) {
            appContext.message?.error(t(err.message || "Login failed"));
        }
        setLoading(false);
    };

    if (isLoggedIn) return <Alert message={t("Login success")} type="success" showIcon />

    return (
        <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            style={{ maxWidth: 300, margin: "0 auto" }}
        >
            <Form.Item name="username" label={t("Username")} rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="password" label={t("Password")} rules={[{ required: true }]}>
                <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
                {t("Login")}
            </Button>
        </Form>
    );
};
