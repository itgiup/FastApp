import {
    ApolloClient,
    gql,
} from "@apollo/client";
import type { LoginResponse, LoginVariables } from "../schemas/user";

export class UserClient {
    private tokenKey = "access_token";
    private client: ApolloClient;

    constructor(client: ApolloClient) {
        this.client = client
    }

    private getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
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

    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Subscribes to user activity updates.
     * @returns An ObservableQuery that you can subscribe to.
     */
    public subscribeUserUpdates(): ObservableQuery<FetchResult<any>> {
        const USER_SUBSCRIPTION = gql`
            subscription UserUpdates {
                userActivity
            }
        `;

        // Use watchQuery to create a subscription-like observable
        const observable = this.client.watchQuery({
            query: USER_SUBSCRIPTION,
            fetchPolicy: 'no-cache', // Important for subscriptions to bypass cache
        });

        return observable;
    }
}