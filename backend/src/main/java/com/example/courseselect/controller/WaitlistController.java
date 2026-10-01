package com.example.courseselect.controller;

import com.example.courseselect.common.Result;
import com.example.courseselect.dto.SelectDTO;
import com.example.courseselect.interceptor.AuthInterceptor;
import com.example.courseselect.service.WaitlistService;
import com.example.courseselect.vo.WaitlistItemVO;
import com.example.courseselect.vo.WaitlistVO;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @GetMapping
    public Result<WaitlistVO> list(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId) {
        return Result.success(waitlistService.list(studentId));
    }

    @PostMapping
    public Result<WaitlistItemVO> join(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId,
                                       @RequestBody SelectDTO dto) {
        return Result.success(waitlistService.join(studentId, dto.teachingClassId()));
    }

    @DeleteMapping("/{teachingClassId}")
    public Result<Map<String, Long>> leave(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId,
                                           @PathVariable Long teachingClassId) {
        waitlistService.leave(studentId, teachingClassId);
        return Result.success(Map.of("classId", teachingClassId));
    }
}
