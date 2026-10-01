package com.example.courseselect.controller;

import com.example.courseselect.common.Result;
import com.example.courseselect.dto.LoginDTO;
import com.example.courseselect.service.AuthService;
import com.example.courseselect.vo.LoginVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/login")
    public Result<LoginVO> login(@RequestBody LoginDTO dto) {
        return Result.success(authService.login(dto.studentNo(), dto.password()));
    }

    @GetMapping("/health")
    public Result<Map<String, Boolean>> health() {
        return Result.success(Map.of("ok", true));
    }
}
