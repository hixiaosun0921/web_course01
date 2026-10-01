package com.example.courseselect.mapper;

import com.example.courseselect.mapper.row.ClassCountRow;
import com.example.courseselect.mapper.row.ClassRow;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface SelectionMapper {

    @Select("SELECT teaching_class_id FROM selection WHERE student_id = #{studentId}")
    List<Long> findClassIds(Long studentId);

    @Select("""
            SELECT tc.id AS class_id, tc.class_name, tc.teacher, tc.class_time, tc.classroom,
                   tc.day_of_week, tc.start_section, tc.end_section, tc.start_week, tc.end_week,
                   tc.capacity, tc.selected_count,
                   c.id AS course_id_db, c.course_no, c.name AS course_name, c.credit, c.category
            FROM selection s
            JOIN teaching_class tc ON tc.id = s.teaching_class_id
            JOIN course c ON c.id = tc.course_id
            WHERE s.student_id = #{studentId}
            ORDER BY s.select_time
            """)
    List<ClassRow> findRowsByStudent(Long studentId);

    @Select("SELECT COUNT(*) FROM selection WHERE student_id = #{studentId} AND teaching_class_id = #{classId}")
    int countSelection(@Param("studentId") Long studentId, @Param("classId") Long classId);

    @Select("""
            SELECT COUNT(*) FROM selection s
            JOIN teaching_class tc ON tc.id = s.teaching_class_id
            WHERE s.student_id = #{studentId} AND tc.course_id = #{courseId}
            """)
    int countByCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Select("""
            SELECT COALESCE(SUM(c.credit), 0) FROM selection s
            JOIN teaching_class tc ON tc.id = s.teaching_class_id
            JOIN course c ON c.id = tc.course_id
            WHERE s.student_id = #{studentId}
            """)
    BigDecimal sumCredit(Long studentId);

    @Insert("INSERT INTO selection(student_id, teaching_class_id) VALUES(#{studentId}, #{classId})")
    int insert(@Param("studentId") Long studentId, @Param("classId") Long classId);

    @Delete("DELETE FROM selection WHERE student_id = #{studentId} AND teaching_class_id = #{classId}")
    int delete(@Param("studentId") Long studentId, @Param("classId") Long classId);

    /** 各教学班真实选课人数（刷新余量时的下限，防止把已选人数刷掉） */
    @Select("SELECT teaching_class_id AS class_id, COUNT(*) AS cnt FROM selection GROUP BY teaching_class_id")
    List<ClassCountRow> countGroupByClass();
}
