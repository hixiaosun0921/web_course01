import axios from 'axios';

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const TOKEN_KEY = 'course-select-token';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000
});

request.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  response => {
    const body = response.data;
    if (body.code === 0) return body.data;
    if (body.code === 1001) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('course-select-student');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    throw new ApiError(body.code, body.message || '请求失败');
  },
  error => {
    throw new ApiError(5000, '网络异常，请稍后重试');
  }
);

export default request;
