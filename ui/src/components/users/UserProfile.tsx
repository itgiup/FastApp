import { type FC, useEffect, useState } from "react";
import type { UserClient } from "../../services/user";
import { Card, Typography, Spin, Alert, } from "antd";
import { useTranslation } from "react-i18next";
import { appContext } from "../../services";

const { Text } = Typography;

interface Props {
    client: UserClient;
}

export const UserProfile: FC<Props> = ({ client }) => {
    const { t } = useTranslation();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const data = await client.getMe();
                setUser(data);
            } catch (err: any) {
                setError(err.message || t("user.loadFailed"));
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [client, t]);

    const updateField = async (field: string, value: string) => {
        if (!user) return;


        try {
            const variables = { username: user.username, email: user.email };
            variables[field] = value;

            const success = await client.updateUser(variables);
            if (success) {
                appContext.message?.success(t("user.updateSuccess"));
                setUser(success)
            } else
                appContext.message?.error(t("user.updateFailed"));
        } catch (err: any) {
            appContext.message?.error(err.message || t("user.updateFailed"));
        }
    };

    if (loading) return <Spin tip={t("loading")} style={{ display: "block", margin: "50px auto" }} />;
    if (error) return <Alert type="error" message={error} style={{ margin: "20px" }} />;
    if (!user) return <Alert type="warning" message={t("user.notLoggedIn")} style={{ margin: "20px" }} />;

    return (
        <Card
            title={t("user.profile")}
            style={{ maxWidth: 500, margin: "30px auto" }}
        >
            <p>
                <strong>{t("user.username")}:</strong>{" "}
                <Text
                    editable={{
                        onChange: (val) => updateField("username", val),
                    }}
                >
                    {user.username}
                </Text>
            </p>

            <p>
                <strong>{t("user.email")}:</strong>{" "}
                <Text
                    editable={{
                        onChange: (val) => updateField("email", val),
                    }}
                >
                    {user.email}
                </Text>
            </p>

            <Card type="inner" title={t("user.otherInfo")} style={{ marginTop: 20 }}>
                <p><strong>{t("user.id")}:</strong> {user.id}</p>
                <p><strong>{t("user.active")}:</strong> {user.is_active ? t("yes") : t("no")}</p>
                <p><strong>{t("user.admin")}:</strong> {user.is_superuser ? t("yes") : t("no")}</p>
            </Card>
        </Card>
    );
};
