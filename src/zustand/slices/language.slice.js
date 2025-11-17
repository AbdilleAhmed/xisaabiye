import { create } from 'zustand';
import en from '../../translations/en';
import so from '../../translations/so';

const translations = { en, so };
// use language slice 
const useLanguageStore = create((set) => ({
  language: 'en',
  translations,
  setLanguage: (lng) => set({ language: lng }),
}));

export default useLanguageStore;

