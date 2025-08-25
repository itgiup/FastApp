import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

export function createGQLClient(httpUri: string, wsUri: string) {

    const httpLink = new HttpLink({
        uri: httpUri,
    });

    const wsClient = createClient({
        url: wsUri,
        retryAttempts: Infinity,
        retryWait: async (retries: number) => {
            const ms = retries < 2 ? [1000, 2000][retries] : 5000;
            await new Promise((resolve) => setTimeout(resolve, ms));
        },
        on: {
            connected: () => {
                console.log("[TickWA] WS connected");
            },
            closed: () => {
                console.log("[TickWA] WS disconnected");
            },
        },
    });

    const wsLink = new GraphQLWsLink(wsClient);

    const splitLink = ApolloLink.split(
        ({ query }) => {
            const def = getMainDefinition(query);
            return (
                def.kind === "OperationDefinition" &&
                def.operation === "subscription"
            );
        },
        wsLink,
        httpLink
    );

    return new ApolloClient({
        link: splitLink,
        cache: new InMemoryCache(),
    });
}

export function ping(client: ApolloClient) {
    // client;
}