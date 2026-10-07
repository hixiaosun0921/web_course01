package com.example.courseselect.service;

import com.example.courseselect.common.BusinessException;
import com.example.courseselect.common.ErrorCode;
import com.example.courseselect.dto.StudentDTO;
import com.example.courseselect.mapper.StudentAdminMapper;
import com.example.courseselect.mapper.row.StudentAdminRow;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 学生管理（FR-21） */
@Service
public class AdminStudentService {

    private static final String DEFAULT_PASSWORD = "123456";

    private final StudentAdminMapper studentAdminMapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminStudentService(StudentAdminMapper studentAdminMapper) {
        this.studentAdminMapper = studentAdminMapper;
    }

    public List<StudentAdminRow> list(String keyword) {
        return studentAdminMapper.list(keyword == null ? "" : keyword.trim());
    }

    public void create(StudentDTO dto) {
        String studentNo = require(dto.studentNo(), "学号不能为空");
        String name = require(dto.name(), "姓名不能为空");
        if (studentAdminMapper.countByNo(studentNo) > 0) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, "学号已存在");
        }
        studentAdminMapper.insert(studentNo, passwordEncoder.encode(DEFAULT_PASSWORD), name,
                dto.gender(), dto.major(), dto.grade(), dto.phone(), dto.email(), dto.collegeId());
    }

    public void update(Long id, StudentDTO dto) {
        requireExists(id);
        String name = require(dto.name(), "姓名不能为空");
        studentAdminMapper.update(id, name, dto.gender(), dto.major(), dto.grade(),
                dto.phone(), dto.email(), dto.collegeId());
    }

    /** 删除学生并级联清理其选课、意向单、候补记录 */
    @Transactional
    public void delete(Long id) {
        requireExists(id);
        studentAdminMapper.deleteSelections(id);
        studentAdminMapper.deleteWishes(id);
        studentAdminMapper.deleteWaitlists(id);
        studentAdminMapper.delete(id);
    }

    public void resetPassword(Long id) {
        requireExists(id);
        studentAdminMapper.updatePassword(id, passwordEncoder.encode(DEFAULT_PASSWORD));
    }

    private void requireExists(Long id) {
        if (id == null || studentAdminMapper.countById(id) == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "学生不存在");
        }
    }

    private String require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_INVALID, message);
        }
        return value.trim();
    }
}
