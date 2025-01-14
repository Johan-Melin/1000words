import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV();

export const setKnownWord = (word: string) => {
    storage.set(word, true);
};
  
export const isKnownWord = (word: string): boolean => {
    return storage.getBoolean(word) || false;
};