package com.example.courseselect.vo;

import java.math.BigDecimal;

public record SelectResultVO(
        Long classId,
        Integer selected,
        Integer remaining,
        BigDecimal credit,
        Integer count) {
}
