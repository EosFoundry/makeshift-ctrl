import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 23);
export type Nanoid = typeof nanoid
