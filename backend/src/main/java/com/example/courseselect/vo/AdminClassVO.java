package com.example.courseselect.vo;

public record AdminClassVO(
        Long id,
        String courseId,
        String courseName,
        String className,
        String teacher,
        String classTime,
        String room,
        Integer day,
        Integer start,
        Integer end,
        Integer startWeek,
        Integer endWeek,
        Integer capacity,
        Integer selected,
        Integer remaining,
        Integer waitCount,
        Integer usage) {
}
