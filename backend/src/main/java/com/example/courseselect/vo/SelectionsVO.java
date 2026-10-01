package com.example.courseselect.vo;

import java.math.BigDecimal;
import java.util.List;

public record SelectionsVO(
        List<Long> classIds,
        BigDecimal credit,
        Integer count,
        List<SelectionVO> list) {
}
