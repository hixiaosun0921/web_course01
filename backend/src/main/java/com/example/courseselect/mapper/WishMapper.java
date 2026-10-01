package com.example.courseselect.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WishMapper {

    @Select("SELECT teaching_class_id FROM wish WHERE student_id = #{studentId} ORDER BY create_time")
    List<Long> findClassIds(Long studentId);

    @Select("SELECT COUNT(*) FROM wish WHERE student_id = #{studentId}")
    int count(Long studentId);

    @Insert("""
            INSERT INTO wish(student_id, teaching_class_id) VALUES(#{studentId}, #{classId})
            ON CONFLICT (student_id, teaching_class_id) DO NOTHING
            """)
    int insert(@Param("studentId") Long studentId, @Param("classId") Long classId);

    @Delete("DELETE FROM wish WHERE student_id = #{studentId} AND teaching_class_id = #{classId}")
    int delete(@Param("studentId") Long studentId, @Param("classId") Long classId);
}
