package com.example.courseselect.vo;

public record TeachingClassVO(
        Long classId,
        String className,
        String teacher,
        String room,
        String classTime,
        Integer day,
        Integer start,
        Integer end,
        Integer startWeek,
        Integer endWeek,
        Integer capacity,
        Integer selected,
        Integer remaining) {
}
