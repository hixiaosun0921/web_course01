package com.example.courseselect.service;

import com.example.courseselect.common.BusinessException;
import com.example.courseselect.common.ErrorCode;
import com.example.courseselect.entity.Admin;
import com.example.courseselect.entity.Student;
import com.example.courseselect.mapper.AdminMapper;
import com.example.courseselect.mapper.StudentMapper;
import com.example.courseselect.util.JwtUtil;
import com.example.courseselect.vo.LoginVO;
import com.example.courseselect.vo.UserVO;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StudentMapper studentMapper;
    private final AdminMapper adminMapper;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(StudentMapper studentMapper, AdminMapper adminMapper, JwtUtil jwtUtil) {
        this.studentMapper = studentMapper;
        this.adminMapper = adminMapper;
        this.jwtUtil = jwtUtil;
    }

    /** 统一登录：先按管理员账号匹配，再按学生学号匹配（FR-01 / FR-16） */
    public LoginVO login(String account, String password) {
        if (account == null || account.isBlank() || password == null) {
            throw new BusinessException(ErrorCode.BAD_CREDENTIALS, "账号或密码错误");
        }
        String no = account.trim();

        Admin admin = adminMapper.findByNo(no);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            return new LoginVO(
                    jwtUtil.createToken(admin.getId(), admin.getAdminNo(), JwtUtil.ROLE_ADMIN),
                    JwtUtil.ROLE_ADMIN,
                    new UserVO(admin.getAdminNo(), admin.getName()));
        }

        Student student = studentMapper.findByNo(no);
        if (student != null && passwordEncoder.matches(password, student.getPassword())) {
            return new LoginVO(
                    jwtUtil.createToken(student.getId(), student.getStudentNo(), JwtUtil.ROLE_STUDENT),
                    JwtUtil.ROLE_STUDENT,
                    new UserVO(student.getStudentNo(), student.getName()));
        }

        throw new BusinessException(ErrorCode.BAD_CREDENTIALS, "账号或密码错误");
    }
}
