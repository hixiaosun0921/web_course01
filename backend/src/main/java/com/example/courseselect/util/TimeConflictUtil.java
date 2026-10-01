package com.example.courseselect.util;

import com.example.courseselect.mapper.row.ClassRow;

/**
 * 时间冲突判定（BR-03）：星期相同且节次、周次区间均重叠
 */
public final class TimeConflictUtil {

    private TimeConflictUtil() {
    }

    public static boolean conflict(ClassRow a, ClassRow b) {
        return a.getDayOfWeek() == b.getDayOfWeek()
                && a.getStartSection() <= b.getEndSection() && a.getEndSection() >= b.getStartSection()
                && a.getStartWeek() <= b.getEndWeek() && a.getEndWeek() >= b.getStartWeek();
    }

    public static String timeText(ClassRow row) {
        String[] days = {"", "周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        return days[row.getDayOfWeek()] + " " + row.getStartSection() + "-" + row.getEndSection()
                + " 节 · " + row.getStartWeek() + "-" + row.getEndWeek() + " 周";
    }
}
