package com.example.courseselect.vo;

import java.math.BigDecimal;
import java.util.List;

public record CourseVO(
        String courseId,
        String name,
        BigDecimal credit,
        String category,
        Integer classCount,
        List<TeachingClassVO> classes) {
}
