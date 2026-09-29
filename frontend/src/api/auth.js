import request from './request';

export function login(studentNo, password) {
  return request.post('/auth/login', { studentNo, password });
}
