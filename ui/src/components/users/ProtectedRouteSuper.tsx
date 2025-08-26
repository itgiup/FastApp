/**
 * Bảo vệ route (ProtectedRouteSuper.tsx hoặc middleware)
 * Để chặn truy cập khi chưa đăng nhập. Có thể làm component HOC hoặc hook:
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRouteSuper() {
    const { isLoggedIn, isSuper } = useAuth();
    if (!isLoggedIn || !isSuper) {
        return <Navigate to="/user/login" replace />;
    }
    return <Outlet />;
}