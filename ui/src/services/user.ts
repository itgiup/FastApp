import {
    ApolloClient,
    gql,
} from "@apollo/client";
import type { LoginResponse, LoginState, LoginVariables, UserType, UpdateUserInput } from "../schemas/user";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";



export class UserClient {
    private tokenKey = "access_token";
    private client: ApolloClient;
    public userInfo: UserType | null = null;

    constructor(client: ApolloClient) {
        this.client = client
        this.init();
    }

    public getToken(): string | null {
        const token = localStorage.getItem(this.tokenKey);
        return token;
    }

    /** Kiểm tra token còn hạn không */
    private isTokenValid(token: string): boolean {
        try {
            const decoded: { exp?: number } = jwtDecode(token);
            if (!decoded.exp) return false;
            const now = Math.floor(Date.now() / 1000);
            return decoded.exp > now;
        } catch {
            return false;
        }
    }

    /** Trạng thái login: LOGGED_IN, LOGGED_OUT, EXPIRED */
    public getLoginState(): LoginState {
        const token = this.getToken();
        if (!token) return "LOGGED_OUT";
        return this.isTokenValid(token) ? "LOGGED_IN" : "EXPIRED";
    }

    /** Đã login chưa (và token hợp lệ) */
    public isAuthenticated(): boolean {
        return this.getLoginState() === "LOGGED_IN";
    }

    /** Kiểm tra khi khởi động (có thể gọi ở App.tsx) */
    public init(): void {
        const state = this.getLoginState();
        if (state === "EXPIRED") {
            this.logout();
        }
    }

    public async login(username: string, password: string): Promise<string> {
        const LOGIN_MUTATION = gql`
            mutation Login($username: String!, $password: String!) {
                login(username: $username, password: $password) {
                    accessToken
                }
            }
        `;

        const { data } = await this.client.mutate<LoginResponse, LoginVariables>({
            mutation: LOGIN_MUTATION,
            variables: { username, password },
        });
        const token = data?.login?.accessToken;
        if (!token) throw new Error("Login failed");
        localStorage.setItem(this.tokenKey, token);
        return token;
    }

    public logout(): void {
        localStorage.removeItem(this.tokenKey);
    }

    /** Lấy thông tin user hiện tại từ server */
    public async getMe(): Promise<UserType | null> {
        const token = this.getToken();
        if (!token || !this.isTokenValid(token)) {
            throw new Error("User not authenticated or token expired");
        }

        const ME_QUERY = gql`
            query Me {
                me {
                    id
                    username
                    email
                    isActive
                    isSuperuser
                    createdAt
                    apiKey
                }
            }
        `;

        const response = await this.client.query<{ me: UserType }>({
            query: ME_QUERY,
            context: { headers: { Authorization: `Bearer ${token}` } },
        });

        const me = response?.data?.me;
        if (me) {
            const newMe = { ...me, createdAt: dayjs(me.createdAt) };
            this.userInfo = newMe;
            return newMe;
        }
        return null
    }

    async updateUser(input: UpdateUserInput): Promise<UserType | null> {
        const UPDATE_USER = gql`
            mutation UpdateUser($email: String) {
                updateUser(input: { email: $email }) {
                    id
                    username
                    email
                    isActive
                    isSuperuser
                    createdAt
                    apiKey
                }
            }
        `;

        const token = this.getToken();
        if (!token) throw new Error("No token found");

        try {
            const res = await this.client.mutate<{ updateUser: UserType }>({
                mutation: UPDATE_USER,
                variables: input,
                context: { headers: { Authorization: `Bearer ${token}` } },
            });
            const me = res?.data?.updateUser;
            if (me) {
                const newMe = { ...me, createdAt: dayjs(me.createdAt) };
                this.userInfo = newMe;
                return newMe;
            }
        } catch (err: any) {
            console.error("Update user failed:", err);
            throw new Error(err.message || "Update user failed");
        }
        return null;
    }
}