
import { EventEmitter } from "events";
import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";
import { changeSettings, exportSettings, importSettings, loadSettings, resetSettings, toggleValue } from "./functions";
import type { UserType } from "../schemas/user";
import { UserClient } from "../services/user";

const NAME = "user";

/**
 * "changed" | "loaded" | 
 */
export var event = new EventEmitter();

export type InitialType = {
    token: string | null
    profile: UserType | null
}

export const initialState: InitialType = {
    token: null,
    profile: null,
};

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
