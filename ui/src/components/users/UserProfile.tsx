import { type FC } from "react";
import { Card, Typography, Spin, Alert, Button, Flex, Form, } from "antd";
import { CheckCircleOutlined, CheckCircleTwoTone, LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import { DAYTIMEFORMAT } from "../../utils/time";
import { appContext } from "../../services";
import { UpdateUserInputSchema, type UpdateUserInput } from "../../schemas/user";

const { Text } = Typography;

interface Props {
}
const checkedIcon = <CheckCircleTwoTone twoToneColor="#52c41a" />
const uncheckedIcon = <CheckCircleOutlined />


export const UserProfile: FC<Props> = () => {
    const { t } = useTranslation();
    const { isLoggedIn, profile, logout, userClient, updateUser, loading } = useAuth();


    if (!isLoggedIn) return <Alert type="warning" message={t("Please login to access")} showIcon />;

    const updateField = async (field: keyof UpdateUserInput, value: string) => {
        try {
            if (!profile || !userClient) return;
            const variables = { email: profile.email };
            variables[field] = value;

            // kiểm tra hợp lệ
            const validate = UpdateUserInputSchema.safeParse(variables)
            console.log(validate);
            if (validate.error) {
                appContext.message?.error(t(validate.error.message));
                return;
            }
            return;

            const user = await updateUser(variables);
            if (user) {
                appContext.message?.success(t("user.updateSuccess"));
            } else
                appContext.message?.error(t("user.updateFailed"));
        } catch (err: any) {
            appContext.message?.error(err.message || t("user.updateFailed"));
        }
    };

    if (!profile) return <Alert type="warning" message={t("user.notLoggedIn")} style={{ margin: "20px" }} />;

    return (
        <Card>
            <p>
                <i className="small-info">{t("user.username")}:</i>{" "}
                <Text>
                    {profile.username}
                </Text>
            </p>

            <p>
                <i className="small-info">{t("user.email")}:</i>{" "}
                <Form.Item rules={[{ type: 'email' }]}>
                    <Text
                        editable={{
                            onChange: (val) => updateField("email", val),
                        }}
                    >
                        {profile.email}
                    </Text>
                </Form.Item>
            </p>

            <p><i className="small-info">{t("user.id")}:</i> {profile.id}</p>
            <p><i className="small-info">{t("user.active")}:</i> {profile.isActive ? checkedIcon : uncheckedIcon}</p>
            <p><i className="small-info">{t("user.admin")}:</i> {profile.isSuperuser ? checkedIcon : uncheckedIcon}</p>
            <p><i className="small-info">{profile.createdAt.format(DAYTIMEFORMAT)}</i></p>
            {loading && <Spin spinning />}
            <Flex justify="end">
                <Button danger icon={<LogoutOutlined />} onClick={logout}>{t("Logout")}</Button>
            </Flex>
        </Card>
    );
};
