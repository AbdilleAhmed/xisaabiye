import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

export const useSummaryStore = create((set) => ({
  summary: null,
  loading: false,

  fetchSummary: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/summary");
      set({ summary: res.data, loading: false });
    } catch (error) {
      console.error("Error fetching summary:", error);
      set({ loading: false });
      throw error;
    }
  },
}));
