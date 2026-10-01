package com.example.courseselect.vo;

import java.math.BigDecimal;
import java.util.List;

public record SelectionVO(
        Long classId,
        String courseId,
        String courseName,
        String className,
        String teacher,
        String room,
        BigDecimal credit,
        String category,
        Integer day,
        Integer start,
        Integer end,
        Integer startWeek,
        Integer endWeek,
        String timeText) {
}
