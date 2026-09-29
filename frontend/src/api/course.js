import request from './request';

export function listCourses() {
  return request.get('/courses');
}

/* 刷新余量（模拟其他学生选退课，返回最新的余量列表） */
export function refreshAvailability() {
  return request.post('/classes/refresh');
}

/* 只读取最新余量，不做模拟波动 */
export function fetchAvailability() {
  return request.get('/classes/availability');
}
