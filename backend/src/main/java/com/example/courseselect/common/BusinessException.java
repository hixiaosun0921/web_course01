package com.example.courseselect.common;

/**
 * 业务异常：message 直接返回给前端提示
 */
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
