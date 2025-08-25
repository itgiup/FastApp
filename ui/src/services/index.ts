import type { MessageInstance } from "antd/es/message/interface";
import type { NotificationInstance } from "antd/es/notification/interface";
import { UserClient } from "./user";
import type { ApolloClient } from "@apollo/client";

export interface AppContext {
    message: MessageInstance | null;
    notification: NotificationInstance | null;
    graphQLClient: ApolloClient | null
}

export const appContext: AppContext = {
    message: null,
    notification: null,
    graphQLClient: null,
}

export const services: {
    user: UserClient | null
} = {
    user: null
}

export function startServices() {
    if (!appContext.graphQLClient) throw new Error("appContext.graphQLClient has not initiated");

    services.user = new UserClient(appContext.graphQLClient)
}