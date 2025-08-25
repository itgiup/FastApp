import React from "react";
import { Form, Input, Button, message } from "antd";
import { UserClient } from "../../services/user";

const userClient = new UserClient("http://localhost:8080/graphql");

export const LoginForm: React.FC = () => {
    const onFinish = async (values: { username: string; password: string }) => {
        try {
            const token = await userClient.login(values.username, values.password);
            message.success("Login successful");
            console.log("Token:", token);
        } catch (err: any) {
            message.error(err.message || "Login failed");
        }
    };

    return (
        <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            style={{ maxWidth: 300, margin: "0 auto" }}
        >
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
                Login
            </Button>
        </Form>
    );
};
