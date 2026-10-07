package com.example.courseselect.dto;

public record StudentDTO(Long id, String studentNo, String name, String gender, String major,
                         String grade, String phone, String email, Long collegeId) {
}
