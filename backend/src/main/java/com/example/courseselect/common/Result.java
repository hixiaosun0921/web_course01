package com.example.courseselect.common;

/**
 * 统一响应体：{ code, message, data }（见《系统设计文档》5.1）
 */
public record Result<T>(int code, String message, T data) {

    public static <T> Result<T> success(T data) {
        return new Result<>(0, "success", data);
    }

    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }
}
