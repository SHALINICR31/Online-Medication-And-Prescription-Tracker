const AsyncStorage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};

const API_BASE_URL = 'http://localhost:8080/api';

export const authService = {
  register: async (userData) => {
    console.log('Sending register data:', userData); // debug log

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Register response:', data); // debug log

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    await AsyncStorage.setItem('@medlink_token', data.token);
    await AsyncStorage.setItem('@medlink_user', JSON.stringify(data));
    return data;
  },

  login: async (email, password) => {
    console.log('Sending login:', { email }); // debug log

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response:', data); // debug log

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    await AsyncStorage.setItem('@medlink_token', data.token);
    await AsyncStorage.setItem('@medlink_user', JSON.stringify(data));
    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('@medlink_token');
    await AsyncStorage.removeItem('@medlink_user');
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('@medlink_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('@medlink_token');
    return !!token;
  },
};

export default authService;