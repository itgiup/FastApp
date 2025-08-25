import { type GetThunkAPI } from "@reduxjs/toolkit";
import axios from "axios";
import localforage from "localforage";

/**
 * loadSettings: Tự động lấy settings từ localforage, 
 * nếu không có thì lấy từ settings.json, 
 * nếu không có thì báo lỗi
 */
export async function loadSettings(name: string) {
    let settings = await localforage.getItem(name)
    if (!settings) {
        try {
            settings = JSON.parse((await axios.get(`${name}.json`)).data)
        } catch (err) { }
    }

    if (settings)
        return settings
    else
        throw new Error("SETTING_NOT_FOUND")
}

/**
 * thay đổi giá trị dựa trên @param { key: value }
 * @param args { key: value } giá trị có thể 1 hoặc nhiều
 * @param thunkAPI GetThunkAPI<any>
 * @returns { before: any, after: any }
 */
export async function changeSettings(name: string, args: any, thunkAPI: GetThunkAPI<any>): Promise<any> {
    let settings = (await thunkAPI.getState() as any)[name]
    let _settings = JSON.parse(JSON.stringify(settings));

    Object.entries(args).forEach(([key, value]) => {
        let keys = key.split('.');
        let lastkey = keys[keys.length - 1].trim();
        let obj = keys.slice(0, keys.length - 1).reduce((acc: any, key: string | number) => {
            // nếu không có phần tử đó và chưa phải phần tử cuối thì tạo 
            if (!acc[key])
                acc[key] = {};
            return acc[key];
        }, _settings);
        if (value === null)
            delete obj[lastkey]
        else
            obj[lastkey] = value;
    })

    await localforage.setItem(name, _settings)
    return { before: settings, after: _settings };
}

/**
 * nhập cài đặt vào cài đặt có sẵn
 * @param name tên của database settings
 * @param settings các cài đặt dạng { key: value }
 * @param thunkAPI 
 */
export async function importSettings(name: string, settings: any, thunkAPI: GetThunkAPI<any>) {
    if (settings && typeof settings === 'object') {
        let states = (await thunkAPI.getState() as any)?.[name];
        let after = { ...states, ...settings }
        await localforage.setItem(name, after)
        return { before: states, after }
    }
}

/**
 * xuất dữ liệu hiện có ra json string
 */
export async function exportSettings(name: string, thunkAPI: GetThunkAPI<any>) {
    const settings = (await localforage.getItem(name) as any)
    const states = (await thunkAPI.getState() as any)?.[name];
    return JSON.stringify({ ...settings, ...states })
}

/**
 * xóa tất cả giá trị trong này
 * @param name tên của database settings
 */
export function resetSettings(name: string) {
    localforage.removeItem(name)
}

/**
 * 
 * @param name tên của database
 * @param key tên của khóa biến cần đổi giá trị boolean
 */
export async function toggleValue(name: string, key: string, thunkAPI: GetThunkAPI<any>) {
    const states = (await thunkAPI.getState() as any)?.[name]
    const settings = JSON.parse(JSON.stringify(states))
    const is = !states[key]

    settings[key] = is

    await localforage.setItem(name, settings)
    return { key, is };
}

