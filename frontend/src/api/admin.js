import request from './request';

/* 管理员接口（FR-16~FR-22） */
export const adminApi = {
  // 学院
  colleges: () => request.get('/admin/colleges'),
  createCollege: data => request.post('/admin/colleges', data),
  updateCollege: (id, data) => request.put(`/admin/colleges/${id}`, data),
  deleteCollege: id => request.delete(`/admin/colleges/${id}`),

  // 课程
  courses: keyword => request.get('/admin/courses', { params: { keyword } }),
  createCourse: data => request.post('/admin/courses', data),
  updateCourse: (id, data) => request.put(`/admin/courses/${id}`, data),
  deleteCourse: id => request.delete(`/admin/courses/${id}`),

  // 教学班与总览
  classes: params => request.get('/admin/classes', { params }),
  createClass: data => request.post('/admin/classes', data),
  updateClass: (id, data) => request.put(`/admin/classes/${id}`, data),
  deleteClass: id => request.delete(`/admin/classes/${id}`),

  // 选课名单
  roster: (id, keyword) => request.get(`/admin/classes/${id}/students`, { params: { keyword } }),

  // 学生
  students: keyword => request.get('/admin/students', { params: { keyword } }),
  createStudent: data => request.post('/admin/students', data),
  updateStudent: (id, data) => request.put(`/admin/students/${id}`, data),
  deleteStudent: id => request.delete(`/admin/students/${id}`),
  resetPassword: id => request.post(`/admin/students/${id}/reset-password`),

  // 代选退课
  studentSelections: id => request.get(`/admin/students/${id}/selections`),
  adminSelect: data => request.post('/admin/selections', data),
  adminDrop: (studentId, classId) => request.delete(`/admin/selections/${studentId}/${classId}`)
};

/* 下载导出文件（CSV） */
export async function downloadCsv(url, filename) {
  const blob = await request.get(url, { responseType: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
