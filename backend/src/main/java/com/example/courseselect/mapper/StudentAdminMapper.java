package com.example.courseselect.mapper;

import com.example.courseselect.mapper.row.StudentAdminRow;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/** 学生管理（FR-21） */
@Mapper
public interface StudentAdminMapper {

    @Select("""
            SELECT s.id, s.student_no, s.name, s.gender, s.major, s.grade, s.phone, s.email,
                   s.college_id, c.name AS college_name,
                   (SELECT COUNT(*) FROM selection sel WHERE sel.student_id = s.id) AS selection_count
            FROM student s LEFT JOIN college c ON c.id = s.college_id
            WHERE (#{keyword} = '' OR s.student_no ILIKE '%' || #{keyword} || '%' OR s.name ILIKE '%' || #{keyword} || '%')
            ORDER BY s.student_no
            """)
    List<StudentAdminRow> list(String keyword);

    @Select("SELECT COUNT(*) FROM student WHERE id = #{id}")
    int countById(Long id);

    @Select("SELECT COUNT(*) FROM student WHERE student_no = #{studentNo}")
    int countByNo(String studentNo);

    @Select("SELECT COUNT(*) FROM student WHERE student_no = #{studentNo} AND id <> #{id}")
    int countByNoExcept(@Param("studentNo") String studentNo, @Param("id") Long id);

    @Insert("""
            INSERT INTO student(student_no, password, name, gender, major, grade, phone, email, college_id)
            VALUES(#{studentNo}, #{password}, #{name}, #{gender}, #{major}, #{grade}, #{phone}, #{email}, #{collegeId})
            """)
    int insert(@Param("studentNo") String studentNo,
               @Param("password") String password,
               @Param("name") String name,
               @Param("gender") String gender,
               @Param("major") String major,
               @Param("grade") String grade,
               @Param("phone") String phone,
               @Param("email") String email,
               @Param("collegeId") Long collegeId);

    @Update("""
            UPDATE student SET name = #{name}, gender = #{gender}, major = #{major}, grade = #{grade},
                   phone = #{phone}, email = #{email}, college_id = #{collegeId}
            WHERE id = #{id}
            """)
    int update(@Param("id") Long id,
               @Param("name") String name,
               @Param("gender") String gender,
               @Param("major") String major,
               @Param("grade") String grade,
               @Param("phone") String phone,
               @Param("email") String email,
               @Param("collegeId") Long collegeId);

    @Update("UPDATE student SET password = #{password} WHERE id = #{id}")
    int updatePassword(@Param("id") Long id, @Param("password") String password);

    @Delete("DELETE FROM student WHERE id = #{id}")
    int delete(Long id);

    @Delete("DELETE FROM selection WHERE student_id = #{id}")
    int deleteSelections(Long id);

    @Delete("DELETE FROM wish WHERE student_id = #{id}")
    int deleteWishes(Long id);

    @Delete("DELETE FROM waitlist WHERE student_id = #{id}")
    int deleteWaitlists(Long id);
}
