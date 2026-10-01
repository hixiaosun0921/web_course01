package com.example.courseselect.controller;

import com.example.courseselect.common.Result;
import com.example.courseselect.service.CourseService;
import com.example.courseselect.vo.AvailabilityVO;
import com.example.courseselect.vo.CourseVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/courses")
    public Result<List<CourseVO>> listCourses() {
        return Result.success(courseService.listCourses());
    }

    @GetMapping("/classes/availability")
    public Result<List<AvailabilityVO>> availability() {
        return Result.success(courseService.availability());
    }

    @PostMapping("/classes/refresh")
    public Result<List<AvailabilityVO>> refresh() {
        return Result.success(courseService.refreshAvailability());
    }
}
