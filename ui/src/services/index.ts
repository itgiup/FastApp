import type { MessageInstance } from "antd/es/message/interface";
import type { NotificationInstance } from "antd/es/notification/interface";
import { UserClient } from "./user";
import type { ApolloClient } from "@apollo/client";
import { createGQLClient } from "./graphQLClient";
import store from "../store";

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

/**
 * Khởi tạo các dịch vụ chạy ngầm 
 * @param callbacks các hàm chạy sau khi khởi động xong 
 */
export async function startServices(...callbacks: (() => void)[]) {
    console.log('startServices');
    const { app } = store.getState();
    const GQLClient = createGQLClient(app.apiUrl, app.apiWsUrl);
    appContext.graphQLClient = GQLClient;

    if (!appContext.graphQLClient) throw new Error("appContext.graphQLClient has not initiated");

    services.user = new UserClient(appContext.graphQLClient);

    // Execute each callback function
    callbacks.forEach(callback => {
        // Ensure the element is actually a function before calling it
        if (typeof callback === 'function') {
            callback();
        }
    });
}