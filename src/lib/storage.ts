import { createMMKV } from 'react-native-mmkv';

/**
 * Single shared MMKV instance for the whole app.
 * react-native-mmkv v4 is Nitro-based: use the `createMMKV()` factory
 * (the old `new MMKV()` constructor was removed in v4).
 */
export const storage = createMMKV();
