import axios from 'axios';

axios.defaults.withCredentials = true;

const createUserSlice = (set, get) => ({
  user: {},
  authErrorMessage: '',

  fetchUser: async () => {
    try {
      const { data } = await axios.get('/api/users');
      set({ user: data });
    } catch (err) {
      console.log('fetchUser error:', err);
      set({ user: {} });
    }
  },

  register: async (newUserCredentials) => {
    get().setAuthErrorMessage('');
    try {
      await axios.post('/api/users/register', newUserCredentials);
      get().logIn(newUserCredentials);
    } catch (err) {
      console.log('register error:', err);
      get().setAuthErrorMessage(
        'Oops! Registration failed. That username might already be taken. Try again!'
      );
    }
  },

  logIn: async (userCredentials) => {
    get().setAuthErrorMessage('');
    try {
      await axios.post('/api/users/login', userCredentials);
      get().fetchUser();
    } catch (err) {
      console.log('logIn error:', err);
      if (err.response && err.response.status === 401) {
        get().setAuthErrorMessage(
          'Oops! Login failed. You have entered an invalid username or password. Try again!'
        );
      } else {
        get().setAuthErrorMessage(
          'Oops! Login failed. It might be our fault. Try again!'
        );
      }
    }
  },

  logOut: async () => {
    try {
      await axios.delete('/api/users/logout');
      set({ user: {} });
    } catch (err) {
      console.log('logOut error:', err);
    }
  },

  setAuthErrorMessage: (message) => {
    set({ authErrorMessage: message });
  },
});

export default createUserSlice;
