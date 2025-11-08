import { create } from 'zustand'
import axios from 'axios'

axios.defaults.withCredentials = true

export const useCustomerStore = create((set) => ({
  customers: [],
  loading: false,

  fetchCustomers: async () => {
    set({ loading: true })
    const res = await axios.get('/api/customers')
    set({ customers: res.data })
  },

  searchCustomers: async (query) => {
    const res = await axios.get(`/api/customers/search?query=${query}`)
    set({ customers: res.data })
  },

  addCustomer: async (data) => {
    const res = await axios.post('/api/customers', data)
    set((state) => ({ customers: [res.data, ...state.customers] }))
  },

  updateCustomer: async (id, data) => {
    const res = await axios.put(`/api/customers/${id}`, data)
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? res.data : c
      )
    }))
  },

  deleteCustomer: async (id) => {
    await axios.delete(`/api/customers/${id}`)
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id)
    }))
  }
}))
