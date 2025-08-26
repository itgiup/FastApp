/**
 * Bảo vệ route (ProtectedRoute.tsx hoặc middleware)
 * Để chặn truy cập khi chưa đăng nhập. Có thể làm component HOC hoặc hook:
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) {
        return <Navigate to="/user/login" replace />;
    }
    return <Outlet />;
}