import request from './request';

export function listSelections() {
  return request.get('/selections');
}

export function selectCourse(teachingClassId) {
  return request.post('/selections', { teachingClassId });
}

export function dropCourse(teachingClassId) {
  return request.delete(`/selections/${encodeURIComponent(teachingClassId)}`);
}

export function batchCancel(teachingClassIds) {
  return request.post('/selections/batch-cancel', { teachingClassIds });
}
