/**
 * AuthContext hoặc useAuth hook (quản lý trạng thái đăng nhập).
 * Để lưu, đọc, và clear token toàn cục thay vì mỗi component tự xử lý.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { services } from "../../services";
import type { UserType } from "../../schemas/user";
import type { UserClient } from "../../services/user";

type AuthContextType = {
    token: string | null;
    user: UserType | null;
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    userClient: UserClient
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ userClient, children }) => {

    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load token từ localStorage khi app khởi động
    useEffect(() => {
        (async () => {
            const savedToken = userClient.getToken();
            if (savedToken && userClient.isAuthenticated()) {
                setToken(savedToken);
                await fetchUser(savedToken);
            } else {
                setToken(null);
                setUser(null);
            }
            setLoading(false);
        })();
    }, []);

    const fetchUser = async (token: string) => {
        try {
            const userData = await userClient.getMe();
            setUser(userData ?? null);
        } catch (err: any) {
            console.error("Failed to fetch user:", err);
            setError(err.message || "Failed to fetch user");
            setUser(null);
        }
    };

    // Hàm login
    const login = async (newToken: string) => {
        userClient.login()
        setToken(newToken);
        setLoading(true);
        await fetchUser(newToken);
        setLoading(false);
    };

    // Hàm logout
    const logout = () => {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isLoggedIn: !!user,
                loading,
                error,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook tiện lợi
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};