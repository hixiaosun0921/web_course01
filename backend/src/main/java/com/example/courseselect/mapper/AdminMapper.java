package com.example.courseselect.mapper;

import com.example.courseselect.entity.Admin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AdminMapper {

    @Select("SELECT id, admin_no, password, name FROM admin WHERE admin_no = #{adminNo}")
    Admin findByNo(String adminNo);
}
