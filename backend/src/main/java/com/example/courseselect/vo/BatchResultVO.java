package com.example.courseselect.vo;

import java.math.BigDecimal;
import java.util.List;

public record BatchResultVO(List<Item> results, BigDecimal credit, Integer count) {

    public record Item(Long teachingClassId, boolean success, String reason) {
    }
}
