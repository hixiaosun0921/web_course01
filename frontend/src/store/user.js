import { defineStore } from 'pinia';
import { login as loginApi } from '../api/auth';

const TOKEN_KEY = 'course-select-token';
const ROLE_KEY = 'course-select-role';
const USER_KEY = 'course-select-user';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    role: localStorage.getItem(ROLE_KEY) || '',
    user: readUser()   // { no, name }
  }),
  getters: {
    isLoggedIn: state => !!state.token,
    isAdmin: state => state.role === 'admin',
    homePath: state => (state.role === 'admin' ? '/admin' : '/course-select')
  },
  actions: {
    async login(account, password) {
      const data = await loginApi(account, password);
      this.token = data.token;
      this.role = data.role;
      this.user = data.user;
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(ROLE_KEY, data.role);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    },
    logout() {
      this.token = '';
      this.role = '';
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
});
