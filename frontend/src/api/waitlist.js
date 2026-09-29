import request from './request';

export function listWaitlist() {
  return request.get('/waitlist');
}

export function joinWaitlist(teachingClassId) {
  return request.post('/waitlist', { teachingClassId });
}

export function leaveWaitlist(teachingClassId) {
  return request.delete(`/waitlist/${encodeURIComponent(teachingClassId)}`);
}
