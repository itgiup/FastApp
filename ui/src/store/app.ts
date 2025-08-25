
import { EventEmitter } from "events";
import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";
import { changeSettings, exportSettings, importSettings, loadSettings, resetSettings, toggleValue } from "./functions";
import languages from "../utils/languages";

const NAME = "app";

/**
 * "changed" | "loaded" | 
 */
export var event = new EventEmitter();

export type InitialType = {
    author: string;
    version: string;
    copyYear: number;
    title: string;
    // các cài đặt khác
    theme: string;
    language: string;

    /** http url */
    apiUrl: string;
    /** websocket url */
    apiWsUrl: string;
}

const { protocol, host, hostname, } = document.location;
console.log(protocol, hostname);

export const initialState: InitialType = {
    author: "author",
    version: "0.0.1",
    copyYear: 2025,
    title: "Brand - Features",
    // các cài đặt khác
    theme: "dark",
    language: 'en',
    apiUrl: protocol + '//' + host + '/api/graphql',
    apiWsUrl: (protocol === 'https:' ? 'wss://' : 'ws://') + host + '/api/graphql'
};
console.log(initialState);

export const imports = createAsyncThunk(
    `${NAME}/imports`,
    async (_settings: any, thunkAPI) => importSettings(NAME, _settings, thunkAPI)
)

export const load = createAsyncThunk(
    `${NAME}/load`,
    () => loadSettings(NAME)
)

export const exports = createAsyncThunk(
    `${NAME}/exports`,
    (_: any = {}, thunkAPI) => exportSettings(NAME, thunkAPI)
)

/**
 * change sẽ lưu cài đặt vào localforage
 */
export const change = createAsyncThunk(
    `${NAME}/change`,
    (args: any, thunkAPI) => changeSettings(NAME, args, thunkAPI)
)

export const toggle = createAsyncThunk(
    `${NAME}/toggle`,
    (key: string, thunkAPI) => toggleValue(NAME, key, thunkAPI)
)


export const supportLanguages = [
    { lang: 'en', country: 'gb' },
    { lang: 'vi', country: 'vn' },
    { lang: 'zh', country: 'cn' },
    { lang: 'ru', country: 'ru' }
]

/**
 * Lấy danh sách các ngôn ngữ hỗ trợ
 * @returns Danh sách các ngôn ngữ hỗ trợ
 */
export function getLanguages() {
    return supportLanguages.map((lang) => {
        const language = languages.find((l) => l.code === lang.lang);
        return {
            lang: lang.lang,
            name: language ? language.name : lang.lang,
            country: lang.country
        };
    });
}

const slice = createSlice({
    name: NAME,
    initialState,
    reducers: {
        reset: () => {
            resetSettings(NAME);
        }
    },

    extraReducers: (builder) => {
        builder.addCase(load.fulfilled, (state: any, action: any) => {
            for (const key in action.payload) {
                state[key] = action.payload[key];
            }

            setTimeout(() => {
                event.emit("loaded", action.payload);
            }, 100);
        })
        builder.addCase(load.rejected, (_state, action) => {
            event.emit("loadFailed", action.payload)
        })

        builder.addCase(change.fulfilled, (state: any, action: any) => {
            for (const key in action.payload.after) {
                state[key] = action.payload.after[key];
            }

            setTimeout(() => {
                event.emit("changed", action.payload)
            }, 100);
        })

        builder.addCase(toggle.fulfilled, (state: any, action: any) => {
            const { key, is } = action.payload
            state[key] = is;
        })

        builder.addCase(imports.fulfilled, (state: any, action: any) => {
            for (const key in action.payload.after) {
                if (Object.hasOwnProperty.call(action.payload.after, key))
                    state[key] = action.payload.after[key];
            }

            setTimeout(() => {
                event.emit("imported", action.payload)
                event.emit("loaded", action.payload)
            }, 100);
        })
    },
})
export const { reset, } = slice.actions;
export default slice.reducer;
