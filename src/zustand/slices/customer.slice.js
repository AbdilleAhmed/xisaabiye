import { create } from 'zustand'
import axios from 'axios'

axios.defaults.withCredentials = true

export const useCustomerStore = create((set) => ({
  customers: [],
  loading: false,
  error: null,

  // fetch call customers
  fetchCustomers: async () => {
    try {
      set({ loading: true, error: null })
      const res = await axios.get('/api/customers')
      console.log('Fetched customers:', res.data)
      set({ customers: res.data, loading: false })
    } catch (error) {
      console.error('Error fetching customers:', error)
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // search customer using query
  searchCustomers: async (query) => {
    try {
      set({ loading: true, error: null })
      const res = await axios.get(`/api/customers/search?query=${query}`)
      set({ customers: res.data, loading: false })
    } catch (error) {
      console.error('Error searching customers:', error)
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // add customer function
  addCustomer: async (data) => {
    try {
      set({ loading: true, error: null })
      console.log('Adding customer with data:', data)
      const res = await axios.post('/api/customers', data)
      console.log('Customer added successfully:', res.data)
      set((state) => ({ 
        customers: [res.data, ...state.customers],
        loading: false 
      }))
      return res.data
    } catch (error) {
      console.error('Error adding customer:', error)
      console.error('Error response:', error.response?.data)
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // update customer function
  updateCustomer: async (id, data) => {
    try {
      set({ loading: true, error: null })
      console.log('Updating customer ID:', id, 'with data:', data)
      const res = await axios.put(`/api/customers/${id}`, data)
      console.log('Customer updated successfully:', res.data)
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? res.data : c
        ),
        loading: false
      }))
      return res.data
    } catch (error) {
      console.error('Error updating customer:', error)
      console.error('Error response:', error.response?.data)
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // delete customer
  deleteCustomer: async (id) => {
    try {
      set({ loading: true, error: null })
      console.log('Deleting customer ID:', id)
      await axios.delete(`/api/customers/${id}`)
      console.log('Customer deleted successfully')
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        loading: false
      }))
    } catch (error) {
      console.error('Error deleting customer:', error)
      console.error('Error response:', error.response?.data)
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))