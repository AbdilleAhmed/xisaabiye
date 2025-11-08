import { create } from 'zustand'
import createUserSlice from './slices/user.slice.js'



// Combine user slice and dashboard slice
const useStore = create((...args) => ({
  ...createUserSlice(...args),

 

}))

export default useStore



