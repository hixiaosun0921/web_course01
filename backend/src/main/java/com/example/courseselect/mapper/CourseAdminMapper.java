package com.example.courseselect.mapper;

import com.example.courseselect.mapper.row.CourseAdminRow;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;
import java.util.List;

/** 课程维护（FR-18） */
@Mapper
public interface CourseAdminMapper {

    @Select("""
            SELECT c.id, c.course_no, c.name, c.credit, c.category, c.college_id,
                   co.name AS college_name,
                   (SELECT COUNT(*) FROM teaching_class tc WHERE tc.course_id = c.id) AS class_count
            FROM course c LEFT JOIN college co ON co.id = c.college_id
            WHERE (#{keyword} = '' OR c.course_no ILIKE '%' || #{keyword} || '%' OR c.name ILIKE '%' || #{keyword} || '%')
            ORDER BY c.id
            """)
    List<CourseAdminRow> list(String keyword);

    @Select("SELECT COUNT(*) FROM course WHERE course_no = #{courseNo}")
    int countByNo(String courseNo);

    @Select("SELECT COUNT(*) FROM course WHERE course_no = #{courseNo} AND id <> #{id}")
    int countByNoExcept(@Param("courseNo") String courseNo, @Param("id") Long id);

    @Select("SELECT COUNT(*) FROM teaching_class WHERE course_id = #{id}")
    int countClasses(Long id);

    @Select("SELECT COUNT(*) FROM course WHERE id = #{id}")
    int countById(Long id);

    @Insert("""
            INSERT INTO course(course_no, name, credit, category, college_id)
            VALUES(#{courseNo}, #{name}, #{credit}, #{category}, #{collegeId})
            """)
    int insert(@Param("courseNo") String courseNo,
               @Param("name") String name,
               @Param("credit") BigDecimal credit,
               @Param("category") String category,
               @Param("collegeId") Long collegeId);

    @Update("""
            UPDATE course SET course_no = #{courseNo}, name = #{name}, credit = #{credit},
                   category = #{category}, college_id = #{collegeId}
            WHERE id = #{id}
            """)
    int update(@Param("id") Long id,
               @Param("courseNo") String courseNo,
               @Param("name") String name,
               @Param("credit") BigDecimal credit,
               @Param("category") String category,
               @Param("collegeId") Long collegeId);

    @Delete("DELETE FROM course WHERE id = #{id}")
    int delete(Long id);
}
