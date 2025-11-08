import { create } from 'zustand'
import axios from 'axios'

axios.defaults.withCredentials = true

export const useSummaryStore = create((set) => ({
  summary: null,
  fetchSummary: async () => {
    const res = await axios.get('/api/transactions/summary')
    set({ summary: res.data })
  }
}))
