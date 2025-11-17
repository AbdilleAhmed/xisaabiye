import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

export const useSummaryStore = create((set) => ({
  summary: null,
  loading: false,
  error: null,

  fetchSummary: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/summary?${queryString}` : '/api/summary';
      
      const res = await axios.get(url);
      set({ summary: res.data, loading: false });
      return res.data;
    } catch (error) {
      console.error("Error fetching summary:", error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },
}));