package com.example.courseselect.dto;

import java.math.BigDecimal;

public record CourseDTO(Long id, String courseNo, String name, BigDecimal credit, String category, Long collegeId) {
}
