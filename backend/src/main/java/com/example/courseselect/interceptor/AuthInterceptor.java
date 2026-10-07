package com.example.courseselect.interceptor;

import com.example.courseselect.common.Result;
import com.example.courseselect.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

/**
 * 登录鉴权拦截器（《系统设计文档》8）
 * - /api/admin/** 需要 admin 角色
 * - 其余受保护接口需要 student 角色
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATTR_STUDENT_ID = "studentId";
    public static final String ATTR_ADMIN_ID = "adminId";

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public AuthInterceptor(JwtUtil jwtUtil, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        boolean adminPath = request.getRequestURI().startsWith("/api/admin/");
        String requiredRole = adminPath ? JwtUtil.ROLE_ADMIN : JwtUtil.ROLE_STUDENT;

        String auth = request.getHeader("Authorization");
        String token = auth != null && auth.startsWith("Bearer ") ? auth.substring(7) : null;
        if (token != null) {
            try {
                JwtUtil.TokenInfo info = jwtUtil.parse(token);
                if (requiredRole.equals(info.role())) {
                    request.setAttribute(adminPath ? ATTR_ADMIN_ID : ATTR_STUDENT_ID, info.userId());
                    return true;
                }
                writeJson(response, Result.error(1003, "无权限访问该功能"));
                return false;
            } catch (Exception ignored) {
                // token 无效或过期，按未登录处理
            }
        }
        writeJson(response, Result.error(1001, "未登录或登录已过期"));
        return false;
    }

    private void writeJson(HttpServletResponse response, Result<?> body) throws Exception {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
