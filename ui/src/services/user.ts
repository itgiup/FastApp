import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    ApolloLink,
    gql,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

export class UserClient {
    private tokenKey = "access_token";
    private client: ApolloClient;

    constructor(httpUri: string, wsUri: string) {
        const httpLink = new HttpLink({
            uri: httpUri,
            headers: () => {
                const token = this.getToken();
                return token ? { Authorization: `Bearer ${token}` } : {};
            },
        });

        const wsLink = new GraphQLWsLink(
            createClient({
                url: wsUri,
                connectionParams: () => {
                    const token = this.getToken();
                    return token ? { Authorization: `Bearer ${token}` } : {};
                },
            })
        );

        const splitLink = ApolloLink.split(
            ({ query }) => {
                const def = getMainDefinition(query);
                return def.kind === "OperationDefinition" && def.operation === "subscription";
            },
            wsLink,
            httpLink
        );

        this.client = new ApolloClient({
            link: splitLink,
            cache: new InMemoryCache(),
        });
    }

    public getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    public logout(): void {
        localStorage.removeItem(this.tokenKey);
    }

    public async login(username: string, password: string): Promise<string> {
        const LOGIN_MUTATION = gql`
      mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          accessToken
        }
      }
    `;
        const { data } = await this.client.mutate({
            mutation: LOGIN_MUTATION,
            variables: { username, password },
        });
        const token = data?.login?.accessToken;
        if (!token) throw new Error("Login failed");
        localStorage.setItem(this.tokenKey, token);
        return token;
    }

    public subscribeUserUpdates(callback: (data: any) => void) {
        const USER_SUBSCRIPTION = gql`
      subscription UserUpdates {
        userActivity
      }
    `;
        return this.client.subscribe({ query: USER_SUBSCRIPTION }).subscribe({
            next({ data }) {
                callback(data.userActivity);
            },
            error(err) {
                console.error("Subscription error", err);
            },
        });
    }
}
