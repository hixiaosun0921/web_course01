package com.example.courseselect.mapper;

import com.example.courseselect.entity.Student;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface StudentMapper {

    @Select("SELECT id, student_no, password, name FROM student WHERE student_no = #{studentNo}")
    Student findByNo(String studentNo);
}
