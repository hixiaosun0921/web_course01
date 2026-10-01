package com.example.courseselect.common;

/**
 * 错误码定义（《系统设计文档》5.2）
 */
public final class ErrorCode {

    public static final int UNAUTHORIZED = 1001;      // 未登录 / 凭证过期
    public static final int BAD_CREDENTIALS = 1002;   // 学号或密码错误
    public static final int CLASS_NOT_FOUND = 2001;   // 教学班不存在
    public static final int DUPLICATE_SELECTION = 2002; // 重复选课 / 同课程互斥
    public static final int CLASS_FULL = 2003;        // 教学班已满
    public static final int TIME_CONFLICT = 2004;     // 时间冲突
    public static final int CREDIT_LIMIT = 2005;      // 超出学分上限
    public static final int NOT_SELECTED = 2006;      // 未选该教学班
    public static final int CLASS_AVAILABLE = 2007;   // 尚有余量，无需候补
    public static final int WAITLIST_DUPLICATE = 3001; // 候补重复
    public static final int WAITLIST_NOT_FOUND = 3002; // 候补不存在 / 已失效
    public static final int WISH_LIMIT = 4001;        // 意向单数量超限
    public static final int SYSTEM_ERROR = 5000;      // 系统异常

    private ErrorCode() {
    }
}
