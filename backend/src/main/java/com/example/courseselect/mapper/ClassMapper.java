package com.example.courseselect.mapper;

import com.example.courseselect.mapper.row.ClassRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ClassMapper {

    String BASE_SELECT = """
            SELECT tc.id AS class_id, tc.class_name, tc.teacher, tc.class_time, tc.classroom,
                   tc.day_of_week, tc.start_section, tc.end_section, tc.start_week, tc.end_week,
                   tc.capacity, tc.selected_count,
                   c.id AS course_id_db, c.course_no, c.name AS course_name, c.credit, c.category
            FROM teaching_class tc
            JOIN course c ON c.id = tc.course_id
            """;

    @Select(BASE_SELECT + " ORDER BY c.id, tc.id")
    List<ClassRow> findAllWithCourse();

    @Select(BASE_SELECT + " WHERE tc.id = #{id}")
    ClassRow findById(Long id);

    /** 名额原子扣减（BR-02）：受影响行数为 0 表示已满 */
    @Update("""
            UPDATE teaching_class SET selected_count = selected_count + 1
            WHERE id = #{id} AND selected_count < capacity
            """)
    int incrementIfAvailable(Long id);

    @Update("""
            UPDATE teaching_class SET selected_count = GREATEST(selected_count - 1, 0)
            WHERE id = #{id}
            """)
    int decrement(Long id);

    @Update("UPDATE teaching_class SET selected_count = #{count} WHERE id = #{id}")
    int updateSelectedCount(@Param("id") Long id, @Param("count") int count);
}
