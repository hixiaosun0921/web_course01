package com.example.courseselect.mapper.row;

import java.time.LocalDateTime;

public class RosterRow {

    private Long studentId;
    private String studentNo;
    private String name;
    private String major;
    private String grade;
    private LocalDateTime selectTime;

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentNo() {
        return studentNo;
    }

    public void setStudentNo(String studentNo) {
        this.studentNo = studentNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public LocalDateTime getSelectTime() {
        return selectTime;
    }

    public void setSelectTime(LocalDateTime selectTime) {
        this.selectTime = selectTime;
    }
}
