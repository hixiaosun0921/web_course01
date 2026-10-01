package com.example.courseselect.mapper;

import com.example.courseselect.mapper.row.WaitlistRow;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WaitlistMapper {

    @Select("""
            SELECT teaching_class_id AS class_id, position FROM waitlist
            WHERE student_id = #{studentId} AND status = 1 ORDER BY create_time
            """)
    List<WaitlistRow> findWaitingByStudent(Long studentId);

    @Select("""
            SELECT COUNT(*) FROM waitlist
            WHERE student_id = #{studentId} AND teaching_class_id = #{classId} AND status = 1
            """)
    int countWaiting(@Param("studentId") Long studentId, @Param("classId") Long classId);

    @Select("""
            SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist
            WHERE teaching_class_id = #{classId} AND status = 1
            """)
    int nextPosition(Long classId);

    @Insert("""
            INSERT INTO waitlist(student_id, teaching_class_id, position) VALUES(#{studentId}, #{classId}, #{position})
            """)
    int insert(@Param("studentId") Long studentId, @Param("classId") Long classId, @Param("position") int position);

    @Delete("""
            DELETE FROM waitlist
            WHERE student_id = #{studentId} AND teaching_class_id = #{classId} AND status = 1
            """)
    int deleteWaiting(@Param("studentId") Long studentId, @Param("classId") Long classId);
}
