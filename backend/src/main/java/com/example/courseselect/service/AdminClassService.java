package com.example.courseselect.service;

import com.example.courseselect.common.BusinessException;
import com.example.courseselect.common.ErrorCode;
import com.example.courseselect.dto.ClassDTO;
import com.example.courseselect.mapper.ClassAdminMapper;
import com.example.courseselect.mapper.ClassMapper;
import com.example.courseselect.mapper.CourseAdminMapper;
import com.example.courseselect.mapper.row.ClassRow;
import com.example.courseselect.mapper.row.RosterRow;
import com.example.courseselect.util.CsvUtil;
import com.example.courseselect.util.NumberUtil;
import com.example.courseselect.util.TimeConflictUtil;
import com.example.courseselect.vo.AdminClassVO;
import org.springframework.stereotype.Service;

import java.util.List;

/** 教学班维护、选课总览与名单导出（FR-19 / FR-20 / FR-22） */
@Service
public class AdminClassService {

    private final ClassAdminMapper classAdminMapper;
    private final ClassMapper classMapper;
    private final CourseAdminMapper courseAdminMapper;

    public AdminClassService(ClassAdminMapper classAdminMapper,
                             ClassMapper classMapper,
                             CourseAdminMapper courseAdminMapper) {
        this.classAdminMapper = classAdminMapper;
        this.classMapper = classMapper;
        this.courseAdminMapper = courseAdminMapper;
    }

    /* ---------- 列表与总览 ---------- */

    public List<AdminClassVO> listClasses(String keyword, Long courseId) {
        String kw = keyword == null ? "" : keyword.trim();
        long courseFilter = courseId == null ? 0L : courseId;
        return classAdminMapper.list(kw, courseFilter).stream().map(this::toVO).toList();
    }

    public String overviewCsv(String keyword, Long courseId) {
        StringBuilder sb = new StringBuilder(CsvUtil.BOM);
        sb.append(CsvUtil.row("课程号", "课程名", "教学班", "任课教师", "上课时间", "上课地点",
                "已选人数", "容量", "余量", "使用率", "候补人数")).append("\r\n");
        for (AdminClassVO vo : listClasses(keyword, courseId)) {
            sb.append(CsvUtil.row(
                    vo.courseId(), vo.courseName(), vo.className(), vo.teacher(), vo.classTime(), vo.room(),
                    String.valueOf(vo.selected()), String.valueOf(vo.capacity()), String.valueOf(vo.remaining()),
                    vo.usage() + "%", String.valueOf(vo.waitCount()))).append("\r\n");
        }
        return sb.toString();
    }

    /* ---------- 教学班维护 ---------- */

    public void createClass(ClassDTO dto) {
        validate(dto, true);
        if (courseAdminMapper.countById(dto.courseId()) == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "课程不存在");
        }
        classAdminMapper.insert(dto.courseId(), dto.className().trim(), dto.teacher().trim(),
                timeText(dto), dto.classroom() == null ? "未定" : dto.classroom().trim(),
                dto.dayOfWeek(), dto.startSection(), dto.endSection(), dto.startWeek(), dto.endWeek(),
                dto.capacity());
    }

    public void updateClass(Long id, ClassDTO dto) {
        validate(dto, false);
        ClassRow current = classMapper.findById(id);
        if (current == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "教学班不存在");
        }
        if (dto.capacity() < current.getSelectedCount()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID,
                    "容量不能小于当前已选人数（" + current.getSelectedCount() + " 人）");
        }
        classAdminMapper.update(id, dto.teacher().trim(), timeText(dto),
                dto.classroom() == null ? "未定" : dto.classroom().trim(),
                dto.dayOfWeek(), dto.startSection(), dto.endSection(), dto.startWeek(), dto.endWeek(),
                dto.capacity());
    }

    public void deleteClass(Long id) {
        if (classMapper.findById(id) == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "教学班不存在");
        }
        if (classAdminMapper.countSelections(id) > 0 || classAdminMapper.countWaitlist(id) > 0) {
            throw new BusinessException(ErrorCode.CONSTRAINT_VIOLATION, "该教学班已有学生选课或候补，不能删除");
        }
        classAdminMapper.delete(id);
    }

    /* ---------- 选课名单 ---------- */

    public List<RosterRow> roster(Long classId, String keyword) {
        if (classMapper.findById(classId) == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "教学班不存在");
        }
        return classAdminMapper.roster(classId, keyword == null ? "" : keyword.trim());
    }

    public String rosterCsv(Long classId) {
        ClassRow cls = classMapper.findById(classId);
        if (cls == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "教学班不存在");
        }
        StringBuilder sb = new StringBuilder(CsvUtil.BOM);
        sb.append(CsvUtil.row("课程号", "课程名", "教学班", "教师", "上课时间")).append("\r\n");
        sb.append(CsvUtil.row(cls.getCourseNo(), cls.getCourseName(), cls.getClassName(),
                cls.getTeacher(), TimeConflictUtil.timeText(cls))).append("\r\n");
        sb.append(CsvUtil.row("学号", "姓名", "专业", "年级", "选课时间")).append("\r\n");
        for (RosterRow row : classAdminMapper.roster(classId, "")) {
            sb.append(CsvUtil.row(row.getStudentNo(), row.getName(), row.getMajor(), row.getGrade(),
                    row.getSelectTime() == null ? "" : row.getSelectTime().toString())).append("\r\n");
        }
        return sb.toString();
    }

    /* ---------- 内部工具 ---------- */

    private void validate(ClassDTO dto, boolean requireCourse) {
        if (requireCourse && dto.courseId() == null) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "请选择课程");
        }
        if (dto.className() == null || dto.className().isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "教学班名称不能为空");
        }
        if (dto.teacher() == null || dto.teacher().isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "任课教师不能为空");
        }
        if (dto.dayOfWeek() == null || dto.dayOfWeek() < 1 || dto.dayOfWeek() > 7) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "星期取值不正确");
        }
        if (dto.startSection() == null || dto.endSection() == null
                || dto.startSection() < 1 || dto.endSection() > 12
                || dto.startSection() > dto.endSection()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "节次范围不正确（1~12 节）");
        }
        if (dto.startWeek() == null || dto.endWeek() == null
                || dto.startWeek() < 1 || dto.endWeek() > 20
                || dto.startWeek() > dto.endWeek()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "周次范围不正确（1~20 周）");
        }
        if (dto.capacity() == null || dto.capacity() < 0) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "容量不能为负数");
        }
    }

    private String timeText(ClassDTO dto) {
        String[] days = {"", "周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        return days[dto.dayOfWeek()] + " " + dto.startSection() + "-" + dto.endSection()
                + " 节 · " + dto.startWeek() + "-" + dto.endWeek() + " 周";
    }

    private AdminClassVO toVO(ClassRow row) {
        int selected = row.getSelectedCount() == null ? 0 : row.getSelectedCount();
        int capacity = row.getCapacity() == null ? 0 : row.getCapacity();
        int usage = capacity <= 0 ? 0 : Math.round(selected * 100f / capacity);
        return new AdminClassVO(
                row.getClassId(),
                row.getCourseNo(),
                row.getCourseName(),
                row.getClassName(),
                row.getTeacher(),
                row.getClassTime(),
                row.getClassroom(),
                row.getDayOfWeek(),
                row.getStartSection(),
                row.getEndSection(),
                row.getStartWeek(),
                row.getEndWeek(),
                capacity,
                selected,
                Math.max(0, capacity - selected),
                row.getWaitCount() == null ? 0 : row.getWaitCount(),
                usage);
    }
}
