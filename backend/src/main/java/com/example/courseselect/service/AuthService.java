package com.example.courseselect.service;

import com.example.courseselect.common.BusinessException;
import com.example.courseselect.common.ErrorCode;
import com.example.courseselect.entity.Student;
import com.example.courseselect.mapper.StudentMapper;
import com.example.courseselect.util.JwtUtil;
import com.example.courseselect.vo.LoginVO;
import com.example.courseselect.vo.StudentVO;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StudentMapper studentMapper;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(StudentMapper studentMapper, JwtUtil jwtUtil) {
        this.studentMapper = studentMapper;
        this.jwtUtil = jwtUtil;
    }

    public LoginVO login(String studentNo, String password) {
        if (studentNo == null || studentNo.isBlank() || password == null) {
            throw new BusinessException(ErrorCode.BAD_CREDENTIALS, "学号或密码错误");
        }
        Student student = studentMapper.findByNo(studentNo.trim());
        if (student == null || !passwordEncoder.matches(password, student.getPassword())) {
            throw new BusinessException(ErrorCode.BAD_CREDENTIALS, "学号或密码错误");
        }
        String token = jwtUtil.createToken(student.getId(), student.getStudentNo());
        return new LoginVO(token, new StudentVO(student.getStudentNo(), student.getName()));
    }
}
