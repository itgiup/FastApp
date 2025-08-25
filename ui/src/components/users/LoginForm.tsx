import { type FC } from "react";
import { Form, Input, Button } from "antd";
import { appContext } from "../../services";
import { useTranslation } from "react-i18next";
import { UserErrors } from "../../schemas/user";
import { useNavigate } from "react-router-dom";
import type { UserClient } from "../../services/user";

interface Props {
    client: UserClient
}

export const LoginForm: FC<Props> = ({ client }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const onFinish = async (values: { username: string; password: string }) => {
        if (!client) {
            appContext.message?.error(t(UserErrors.UserClientHasNotInitiated))
            return;
        }
        try {
            const token = await client.login(values.username, values.password);
            if (token) {
                appContext.message?.success("Login successful");
                navigate("/user/me");
            } else
                appContext.message?.error("Login failed");

        } catch (err: any) {
            appContext.message?.error(err.message || "Login failed");
        }
    };

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
            <Button type="primary" htmlType="submit" block>
                {t("Login")}
            </Button>
        </Form>
    );
};
