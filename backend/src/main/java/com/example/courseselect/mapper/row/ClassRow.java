package com.example.courseselect.mapper.row;

import java.math.BigDecimal;

/**
 * 教学班 + 课程 的联表查询行
 */
public class ClassRow {

    private Long classId;
    private String className;
    private String teacher;
    private String classTime;
    private String classroom;
    private Integer dayOfWeek;
    private Integer startSection;
    private Integer endSection;
    private Integer startWeek;
    private Integer endWeek;
    private Integer capacity;
    private Integer selectedCount;
    private Long courseIdDb;
    private String courseNo;
    private String courseName;
    private BigDecimal credit;
    private String category;
    private Integer waitCount;

    public Integer getWaitCount() {
        return waitCount;
    }

    public void setWaitCount(Integer waitCount) {
        this.waitCount = waitCount;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getTeacher() {
        return teacher;
    }

    public void setTeacher(String teacher) {
        this.teacher = teacher;
    }

    public String getClassTime() {
        return classTime;
    }

    public void setClassTime(String classTime) {
        this.classTime = classTime;
    }

    public String getClassroom() {
        return classroom;
    }

    public void setClassroom(String classroom) {
        this.classroom = classroom;
    }

    public Integer getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public Integer getStartSection() {
        return startSection;
    }

    public void setStartSection(Integer startSection) {
        this.startSection = startSection;
    }

    public Integer getEndSection() {
        return endSection;
    }

    public void setEndSection(Integer endSection) {
        this.endSection = endSection;
    }

    public Integer getStartWeek() {
        return startWeek;
    }

    public void setStartWeek(Integer startWeek) {
        this.startWeek = startWeek;
    }

    public Integer getEndWeek() {
        return endWeek;
    }

    public void setEndWeek(Integer endWeek) {
        this.endWeek = endWeek;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getSelectedCount() {
        return selectedCount;
    }

    public void setSelectedCount(Integer selectedCount) {
        this.selectedCount = selectedCount;
    }

    public Long getCourseIdDb() {
        return courseIdDb;
    }

    public void setCourseIdDb(Long courseIdDb) {
        this.courseIdDb = courseIdDb;
    }

    public String getCourseNo() {
        return courseNo;
    }

    public void setCourseNo(String courseNo) {
        this.courseNo = courseNo;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public BigDecimal getCredit() {
        return credit;
    }

    public void setCredit(BigDecimal credit) {
        this.credit = credit;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
