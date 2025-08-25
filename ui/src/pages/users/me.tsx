import { services } from "../../services";
import { useTranslation } from "react-i18next";
import { UserErrors } from "../../schemas/user";
import { UserProfile } from "../../components/users/UserProfile";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function MePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const isAuthenticated = services.user?.isAuthenticated()
    useEffect(() => {
        if (services.user) {
            const isAuthenticated = services.user.isAuthenticated()
            if (!isAuthenticated)
                navigate('/user/login');
        }
    }, [navigate]);

    if (!services.user) return t(UserErrors.UserClientHasNotInitiated)

    if (isAuthenticated)
        return (<>
            <UserProfile client={services.user} />
        </>);
    return '...'
}
