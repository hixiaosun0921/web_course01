package com.example.courseselect.util;

import java.math.BigDecimal;

public final class NumberUtil {

    private NumberUtil() {
    }

    /** 去掉学分尾零（4.0 -> 4），避免前端显示 "4.0 学分" */
    public static BigDecimal normalizeCredit(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal normalized = value.stripTrailingZeros();
        return normalized.scale() < 0 ? normalized.setScale(0) : normalized;
    }
}
