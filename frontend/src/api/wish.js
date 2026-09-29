import request from './request';

export function listWishes() {
  return request.get('/wishes');
}

export function addWish(teachingClassId) {
  return request.post('/wishes', { teachingClassId });
}

export function removeWish(teachingClassId) {
  return request.delete(`/wishes/${encodeURIComponent(teachingClassId)}`);
}
