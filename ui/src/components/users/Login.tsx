import React from "react";
import { Form, Input, Button } from "antd";
import { appContext, services } from "../../services";
import { useTranslation } from "react-i18next";


export const LoginForm: React.FC = () => {
    const { t } = useTranslation();

    const onFinish = async (values: { username: string; password: string }) => {
        const { user } = services;
        if (!user) {
            appContext.message?.error(t("User client has not initiated"))
            return;
        }
        try {
            const token = await user.login(values.username, values.password);
            appContext.message?.success("Login successful");
            console.log("Token:", token);
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
