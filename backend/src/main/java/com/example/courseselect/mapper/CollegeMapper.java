package com.example.courseselect.mapper;

import com.example.courseselect.mapper.row.CollegeRow;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/** 学院维护（FR-17） */
@Mapper
public interface CollegeMapper {

    @Select("""
            SELECT c.id, c.name,
                   (SELECT COUNT(*) FROM course co WHERE co.college_id = c.id) AS course_count,
                   (SELECT COUNT(*) FROM student s WHERE s.college_id = c.id) AS student_count
            FROM college c ORDER BY c.id
            """)
    List<CollegeRow> list();

    @Select("SELECT COUNT(*) FROM college WHERE name = #{name}")
    int countByName(String name);

    @Select("SELECT COUNT(*) FROM college WHERE name = #{name} AND id <> #{id}")
    int countByNameExcept(@Param("name") String name, @Param("id") Long id);

    @Select("SELECT COUNT(*) FROM course WHERE college_id = #{id}")
    int countCourses(Long id);

    @Select("SELECT COUNT(*) FROM student WHERE college_id = #{id}")
    int countStudents(Long id);

    @Insert("INSERT INTO college(name) VALUES(#{name})")
    int insert(String name);

    @Update("UPDATE college SET name = #{name} WHERE id = #{id}")
    int update(@Param("id") Long id, @Param("name") String name);

    @Delete("DELETE FROM college WHERE id = #{id}")
    int delete(Long id);
}
