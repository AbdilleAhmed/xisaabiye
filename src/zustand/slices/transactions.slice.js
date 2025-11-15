import { create } from "zustand";
import axios from "axios";

export const useTransactionStore = create((set) => ({
  transactions: [],
  loading: false,
// fetch transactions function
  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/transactions");
      const transactions = res.data.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
      }));
      set({ transactions, loading: false });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      set({ loading: false });
      throw error;
    }
  },

  fetchTransactionsByCustomer: async (customerId) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/api/transactions/customer/${customerId}`);
      const transactions = res.data.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
      }));
      set({ transactions, loading: false });
    } catch (error) {
      console.error("Error fetching transactions by customer:", error);
      set({ loading: false });
      throw error;
    }
  },

  searchTransactions: async (query) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/api/transactions/search?q=${query}`);
      const transactions = res.data.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
      }));
      set({ transactions, loading: false });
    } catch (error) {
      console.error("Error searching transactions:", error);
      set({ loading: false });
      throw error;
    }
  },

  getTransactionById: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/api/transactions/${id}`);
      return {
        ...res.data,
        amount: parseFloat(res.data.amount),
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      set({ loading: false });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addTransaction: async (transactionData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/api/transactions", transactionData);
      const newTransaction = {
        ...res.data,
        amount: parseFloat(res.data.amount),
      };
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        loading: false,
      }));
      return newTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      set({ loading: false });
      throw error;
    }
  },

  updateTransaction: async (id, transactionData) => {
    set({ loading: true });
    try {
      const res = await axios.put(`/api/transactions/${id}`, transactionData);
      const updatedTransaction = {
        ...res.data,
        amount: parseFloat(res.data.amount),
      };
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updatedTransaction : t
        ),
        loading: false,
      }));
      return updatedTransaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      set({ loading: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/api/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      set({ loading: false });
      throw error;
    }
  },

  clearTransactions: () => {
    set({ transactions: [], loading: false });
  },
}));