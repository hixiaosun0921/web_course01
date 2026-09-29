import { defineStore } from 'pinia';
import { login as loginApi } from '../api/auth';

const TOKEN_KEY = 'course-select-token';
const STUDENT_KEY = 'course-select-student';

function readStudent() {
  try {
    return JSON.parse(localStorage.getItem(STUDENT_KEY) || 'null');
  } catch {
    return null;
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    student: readStudent()
  }),
  getters: {
    isLoggedIn: state => !!state.token
  },
  actions: {
    async login(studentNo, password) {
      const data = await loginApi(studentNo, password);
      this.token = data.token;
      this.student = data.student;
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(STUDENT_KEY, JSON.stringify(data.student));
    },
    logout() {
      this.token = '';
      this.student = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(STUDENT_KEY);
    }
  }
});
