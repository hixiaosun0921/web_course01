package com.example.courseselect.util;

import java.util.Arrays;

/** CSV 导出工具：UTF-8 BOM + 字段转义，Excel 可直接打开 */
public final class CsvUtil {

    public static final String BOM = "\uFEFF";

    private CsvUtil() {
    }

    public static String row(String... fields) {
        return String.join(",", Arrays.stream(fields).map(CsvUtil::escape).toList());
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        String text = value.replace("\"", "\"\"");
        if (text.contains(",") || text.contains("\"") || text.contains("\n")) {
            return "\"" + text + "\"";
        }
        return text;
    }
}
