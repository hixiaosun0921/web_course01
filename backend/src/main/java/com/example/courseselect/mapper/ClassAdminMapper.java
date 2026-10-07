package com.example.courseselect.mapper;

import com.example.courseselect.mapper.row.ClassRow;
import com.example.courseselect.mapper.row.RosterRow;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/** 教学班维护与选课名单（FR-19、FR-22） */
@Mapper
public interface ClassAdminMapper {

    @Select("""
            SELECT tc.id AS class_id, tc.class_name, tc.teacher, tc.class_time, tc.classroom,
                   tc.day_of_week, tc.start_section, tc.end_section, tc.start_week, tc.end_week,
                   tc.capacity, tc.selected_count,
                   c.id AS course_id_db, c.course_no, c.name AS course_name, c.credit, c.category,
                   (SELECT COUNT(*) FROM waitlist w WHERE w.teaching_class_id = tc.id AND w.status = 1) AS wait_count
            FROM teaching_class tc
            JOIN course c ON c.id = tc.course_id
            WHERE (#{keyword} = ''
                   OR c.name ILIKE '%' || #{keyword} || '%'
                   OR c.course_no ILIKE '%' || #{keyword} || '%'
                   OR tc.teacher ILIKE '%' || #{keyword} || '%')
              AND (#{courseId} = 0 OR tc.course_id = #{courseId})
            ORDER BY c.id, tc.id
            """)
    List<ClassRow> list(@Param("keyword") String keyword, @Param("courseId") Long courseId);

    @Select("SELECT COUNT(*) FROM selection WHERE teaching_class_id = #{id}")
    int countSelections(Long id);

    @Select("SELECT COUNT(*) FROM waitlist WHERE teaching_class_id = #{id} AND status = 1")
    int countWaitlist(Long id);

    @Insert("""
            INSERT INTO teaching_class(course_id, class_name, teacher, class_time, classroom,
                                       day_of_week, start_section, end_section, start_week, end_week, capacity)
            VALUES(#{courseId}, #{className}, #{teacher}, #{classTime}, #{classroom},
                   #{dayOfWeek}, #{startSection}, #{endSection}, #{startWeek}, #{endWeek}, #{capacity})
            """)
    int insert(@Param("courseId") Long courseId,
               @Param("className") String className,
               @Param("teacher") String teacher,
               @Param("classTime") String classTime,
               @Param("classroom") String classroom,
               @Param("dayOfWeek") Integer dayOfWeek,
               @Param("startSection") Integer startSection,
               @Param("endSection") Integer endSection,
               @Param("startWeek") Integer startWeek,
               @Param("endWeek") Integer endWeek,
               @Param("capacity") Integer capacity);

    @Update("""
            UPDATE teaching_class SET teacher = #{teacher}, class_time = #{classTime}, classroom = #{classroom},
                   day_of_week = #{dayOfWeek}, start_section = #{startSection}, end_section = #{endSection},
                   start_week = #{startWeek}, end_week = #{endWeek}, capacity = #{capacity}
            WHERE id = #{id}
            """)
    int update(@Param("id") Long id,
               @Param("teacher") String teacher,
               @Param("classTime") String classTime,
               @Param("classroom") String classroom,
               @Param("dayOfWeek") Integer dayOfWeek,
               @Param("startSection") Integer startSection,
               @Param("endSection") Integer endSection,
               @Param("startWeek") Integer startWeek,
               @Param("endWeek") Integer endWeek,
               @Param("capacity") Integer capacity);

    @Delete("DELETE FROM teaching_class WHERE id = #{id}")
    int delete(Long id);

    @Select("""
            SELECT s.id AS student_id, s.student_no, s.name, s.major, s.grade, sel.select_time
            FROM selection sel
            JOIN student s ON s.id = sel.student_id
            WHERE sel.teaching_class_id = #{classId}
              AND (#{keyword} = '' OR s.student_no ILIKE '%' || #{keyword} || '%' OR s.name ILIKE '%' || #{keyword} || '%')
            ORDER BY s.student_no
            """)
    List<RosterRow> roster(@Param("classId") Long classId, @Param("keyword") String keyword);
}
