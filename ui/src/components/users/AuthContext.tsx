/**
 * khi khởi động lên, 
    - nếu client chưa khởi tạo (!client) thì khóa các phần yêu cầu đăng nhập 
    - nếu đã đăng nhập (client.isTokenValid()) thì lấy token
    - nếu chưa (!client.isTokenValid()) thì khóa các phần yêu cầu đăng nhập 
 */
import { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { UserType, UpdateUserInput } from "../../schemas/user";
import { appContext, services } from "../../services";
import type { UserClient } from "../../services/user";

type AuthContextType = {
    token: string | null;
    isLoggedIn: boolean;
    profile: UserType | null;
    isSuper: boolean;
    userClient: UserClient | null
    isAuthenticated: () => Promise<void>
    login: (username: string, password: string) => Promise<string | null>;
    logout: () => void;
    updateUser: (fields: UpdateUserInput) => Promise<UserType | null>;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const { t } = useTranslation();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // loading khi khởi động
    const [profile, setProfile] = useState<UserType | null>(null);
    const [isSuper, setIsSuper] = useState(false);

    // khi mount, kiểm tra client + token
    useEffect(() => {
        isAuthenticated();
    }, [services.user]);

    const isAuthenticated = async () => {
        const userClient = services.user;
        if (!userClient) {
            // client chưa khởi tạo
            setLoading(false);
            return;
        }
        const isAuthenticated = userClient.isAuthenticated();

        if (!isAuthenticated) {
            setToken(null);
        } else {
            try {
                setLoading(true)
                const savedToken = userClient.getToken();
                const profile = await userClient.getMe();
                if (profile) {
                    setProfile(profile);
                    setToken(savedToken);
                } else {
                    setToken(null);
                    setProfile(null);
                }
            } catch (err: any) {
                appContext.message?.error(t(err?.message || err?.error || err))
                setToken(null);
                setProfile(null);
            }
        }

        setLoading(false);
    }

    const login = async (username: string, password: string): Promise<string | null> => {
        const userClient = services.user;
        if (!userClient) return null;
        try {
            setLoading(true);
            const token = await userClient.login(username, password);
            const profile = await userClient.getMe();
            if (profile) {
                setToken(token);
                setProfile(profile);
            } else {
                setToken(null);
                setProfile(null);
            }
            setLoading(false);
            return token;
        } catch (err: any) {
            appContext.message?.error(t(err?.message || err.error || err))
            setToken(null);
            setProfile(null);
        }
        setLoading(false);
        return null;
    };

    const logout = () => {
        const client = services.user;
        if (client) client.logout(); // xóa token client
        setToken(null);
        setProfile(null);
    };

    const updateUser = async (fields: UpdateUserInput): Promise<UserType | null> => {
        const userClient = services.user;
        if (!userClient) return null;
        setLoading(true)
        const profile = await userClient.updateUser(fields);
        setProfile(profile)
        setLoading(false)
        return profile;
    }

    useEffect(() => {
        setIsSuper(profile?.isSuperuser === true);
    }, [profile])


    return (
        <AuthContext.Provider
            value={{
                userClient: services.user,
                token, isLoggedIn: !!token,
                profile,
                isSuper,
                isAuthenticated,
                login, logout,
                updateUser,
                loading
            }}>
            {/* {loading ? <LoadingOutlined spin /> :  */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
