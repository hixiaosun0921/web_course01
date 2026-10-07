package com.example.courseselect.dto;

public record ClassDTO(Long id, Long courseId, String className, String teacher,
                       Integer dayOfWeek, Integer startSection, Integer endSection,
                       Integer startWeek, Integer endWeek, String classroom, Integer capacity) {
}
