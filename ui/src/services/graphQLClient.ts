import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";

export function createGQLClient(httpUri: string, wsUri: string) {
    const httpLink = new HttpLink({
        uri: httpUri,
    });

    const wsLink = new GraphQLWsLink(
        createClient({
            url: wsUri,
        })
    );

    const splitLink = ApolloLink.split(
        ({ operationType }) => {
            return operationType === OperationTypeNode.SUBSCRIPTION;
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