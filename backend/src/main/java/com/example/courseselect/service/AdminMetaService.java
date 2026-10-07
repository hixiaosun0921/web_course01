package com.example.courseselect.service;

import com.example.courseselect.common.BusinessException;
import com.example.courseselect.common.ErrorCode;
import com.example.courseselect.dto.CollegeDTO;
import com.example.courseselect.dto.CourseDTO;
import com.example.courseselect.mapper.CollegeMapper;
import com.example.courseselect.mapper.CourseAdminMapper;
import com.example.courseselect.mapper.row.CollegeRow;
import com.example.courseselect.mapper.row.CourseAdminRow;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/** 学院与课程维护（FR-17 / FR-18） */
@Service
public class AdminMetaService {

    private static final List<String> CATEGORIES =
            List.of("主修课程", "通识选修课", "英语分项", "体育分项");

    private final CollegeMapper collegeMapper;
    private final CourseAdminMapper courseAdminMapper;

    public AdminMetaService(CollegeMapper collegeMapper, CourseAdminMapper courseAdminMapper) {
        this.collegeMapper = collegeMapper;
        this.courseAdminMapper = courseAdminMapper;
    }

    /* ---------- 学院 ---------- */

    public List<CollegeRow> listColleges() {
        return collegeMapper.list();
    }

    public void createCollege(CollegeDTO dto) {
        String name = requireName(dto.name());
        if (collegeMapper.countByName(name) > 0) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "学院名称已存在");
        }
        collegeMapper.insert(name);
    }

    public void updateCollege(Long id, CollegeDTO dto) {
        String name = requireName(dto.name());
        if (collegeMapper.countByNameExcept(name, id) > 0) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "学院名称已存在");
        }
        if (collegeMapper.update(id, name) == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "学院不存在");
        }
    }

    public void deleteCollege(Long id) {
        if (collegeMapper.countCourses(id) > 0 || collegeMapper.countStudents(id) > 0) {
            throw new BusinessException(ErrorCode.CONSTRAINT_VIOLATION, "该学院下存在课程或学生，不能删除");
        }
        if (collegeMapper.delete(id) == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "学院不存在");
        }
    }

    /* ---------- 课程 ---------- */

    public List<CourseAdminRow> listCourses(String keyword) {
        return courseAdminMapper.list(keyword == null ? "" : keyword.trim());
    }

    public void createCourse(CourseDTO dto) {
        validateCourse(dto);
        if (courseAdminMapper.countByNo(dto.courseNo().trim()) > 0) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "课程号已存在");
        }
        courseAdminMapper.insert(dto.courseNo().trim(), dto.name().trim(), dto.credit(),
                dto.category(), dto.collegeId());
    }

    public void updateCourse(Long id, CourseDTO dto) {
        validateCourse(dto);
        if (courseAdminMapper.countByNoExcept(dto.courseNo().trim(), id) > 0) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "课程号已存在");
        }
        if (courseAdminMapper.update(id, dto.courseNo().trim(), dto.name().trim(), dto.credit(),
                dto.category(), dto.collegeId()) == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "课程不存在");
        }
    }

    public void deleteCourse(Long id) {
        if (courseAdminMapper.countClasses(id) > 0) {
            throw new BusinessException(ErrorCode.CONSTRAINT_VIOLATION, "该课程下存在教学班，不能删除");
        }
        if (courseAdminMapper.delete(id) == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "课程不存在");
        }
    }

    private void validateCourse(CourseDTO dto) {
        if (dto.courseNo() == null || dto.courseNo().isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "课程号不能为空");
        }
        if (dto.name() == null || dto.name().isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "课程名称不能为空");
        }
        if (dto.credit() == null || dto.credit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "学分必须大于 0");
        }
        if (dto.category() == null || !CATEGORIES.contains(dto.category())) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "课程类别不正确");
        }
    }

    private String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "名称不能为空");
        }
        return name.trim();
    }
}
