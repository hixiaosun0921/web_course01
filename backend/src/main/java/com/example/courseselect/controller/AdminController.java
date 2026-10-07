package com.example.courseselect.controller;

import com.example.courseselect.common.Result;
import com.example.courseselect.dto.AdminSelectDTO;
import com.example.courseselect.dto.ClassDTO;
import com.example.courseselect.dto.CollegeDTO;
import com.example.courseselect.dto.CourseDTO;
import com.example.courseselect.dto.StudentDTO;
import com.example.courseselect.mapper.row.CollegeRow;
import com.example.courseselect.mapper.row.CourseAdminRow;
import com.example.courseselect.mapper.row.RosterRow;
import com.example.courseselect.mapper.row.StudentAdminRow;
import com.example.courseselect.service.AdminClassService;
import com.example.courseselect.service.AdminMetaService;
import com.example.courseselect.service.AdminStudentService;
import com.example.courseselect.service.SelectionService;
import com.example.courseselect.vo.AdminClassVO;
import com.example.courseselect.vo.SelectResultVO;
import com.example.courseselect.vo.SelectionsVO;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/** 管理员控制台接口（FR-16~FR-22） */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminMetaService metaService;
    private final AdminClassService classService;
    private final AdminStudentService studentService;
    private final SelectionService selectionService;

    public AdminController(AdminMetaService metaService,
                           AdminClassService classService,
                           AdminStudentService studentService,
                           SelectionService selectionService) {
        this.metaService = metaService;
        this.classService = classService;
        this.studentService = studentService;
        this.selectionService = selectionService;
    }

    /* ---------- 学院 ---------- */

    @GetMapping("/colleges")
    public Result<List<CollegeRow>> listColleges() {
        return Result.success(metaService.listColleges());
    }

    @PostMapping("/colleges")
    public Result<Void> createCollege(@RequestBody CollegeDTO dto) {
        metaService.createCollege(dto);
        return Result.success(null);
    }

    @PutMapping("/colleges/{id}")
    public Result<Void> updateCollege(@PathVariable Long id, @RequestBody CollegeDTO dto) {
        metaService.updateCollege(id, dto);
        return Result.success(null);
    }

    @DeleteMapping("/colleges/{id}")
    public Result<Void> deleteCollege(@PathVariable Long id) {
        metaService.deleteCollege(id);
        return Result.success(null);
    }

    /* ---------- 课程 ---------- */

    @GetMapping("/courses")
    public Result<List<CourseAdminRow>> listCourses(@RequestParam(required = false) String keyword) {
        return Result.success(metaService.listCourses(keyword));
    }

    @PostMapping("/courses")
    public Result<Void> createCourse(@RequestBody CourseDTO dto) {
        metaService.createCourse(dto);
        return Result.success(null);
    }

    @PutMapping("/courses/{id}")
    public Result<Void> updateCourse(@PathVariable Long id, @RequestBody CourseDTO dto) {
        metaService.updateCourse(id, dto);
        return Result.success(null);
    }

    @DeleteMapping("/courses/{id}")
    public Result<Void> deleteCourse(@PathVariable Long id) {
        metaService.deleteCourse(id);
        return Result.success(null);
    }

    /* ---------- 教学班与总览 ---------- */

    @GetMapping("/classes")
    public Result<List<AdminClassVO>> listClasses(@RequestParam(required = false) String keyword,
                                                  @RequestParam(required = false) Long courseId) {
        return Result.success(classService.listClasses(keyword, courseId));
    }

    @PostMapping("/classes")
    public Result<Void> createClass(@RequestBody ClassDTO dto) {
        classService.createClass(dto);
        return Result.success(null);
    }

    @PutMapping("/classes/{id}")
    public Result<Void> updateClass(@PathVariable Long id, @RequestBody ClassDTO dto) {
        classService.updateClass(id, dto);
        return Result.success(null);
    }

    @DeleteMapping("/classes/{id}")
    public Result<Void> deleteClass(@PathVariable Long id) {
        classService.deleteClass(id);
        return Result.success(null);
    }

    @GetMapping("/overview")
    public Result<List<AdminClassVO>> overview(@RequestParam(required = false) String keyword,
                                               @RequestParam(required = false) Long courseId) {
        return Result.success(classService.listClasses(keyword, courseId));
    }

    @GetMapping("/overview.csv")
    public ResponseEntity<byte[]> overviewCsv(@RequestParam(required = false) String keyword,
                                              @RequestParam(required = false) Long courseId) {
        return csv("overview.csv", classService.overviewCsv(keyword, courseId));
    }

    /* ---------- 选课名单 ---------- */

    @GetMapping("/classes/{id}/students")
    public Result<List<RosterRow>> roster(@PathVariable Long id,
                                          @RequestParam(required = false) String keyword) {
        return Result.success(classService.roster(id, keyword));
    }

    @GetMapping("/classes/{id}/students.csv")
    public ResponseEntity<byte[]> rosterCsv(@PathVariable Long id) {
        return csv("class-" + id + "-students.csv", classService.rosterCsv(id));
    }

    /* ---------- 学生 ---------- */

    @GetMapping("/students")
    public Result<List<StudentAdminRow>> listStudents(@RequestParam(required = false) String keyword) {
        return Result.success(studentService.list(keyword));
    }

    @PostMapping("/students")
    public Result<Void> createStudent(@RequestBody StudentDTO dto) {
        studentService.create(dto);
        return Result.success(null);
    }

    @PutMapping("/students/{id}")
    public Result<Void> updateStudent(@PathVariable Long id, @RequestBody StudentDTO dto) {
        studentService.update(id, dto);
        return Result.success(null);
    }

    @DeleteMapping("/students/{id}")
    public Result<Void> deleteStudent(@PathVariable Long id) {
        studentService.delete(id);
        return Result.success(null);
    }

    @PostMapping("/students/{id}/reset-password")
    public Result<Map<String, String>> resetPassword(@PathVariable Long id) {
        studentService.resetPassword(id);
        return Result.success(Map.of("password", "123456"));
    }

    /* ---------- 代选退课 ---------- */

    @GetMapping("/students/{id}/selections")
    public Result<SelectionsVO> studentSelections(@PathVariable Long id) {
        return Result.success(selectionService.getSelections(id));
    }

    @PostMapping("/selections")
    public Result<SelectResultVO> adminSelect(@RequestBody AdminSelectDTO dto) {
        return Result.success(selectionService.select(dto.studentId(), dto.teachingClassId()));
    }

    @DeleteMapping("/selections/{studentId}/{classId}")
    public Result<SelectResultVO> adminDrop(@PathVariable Long studentId, @PathVariable Long classId) {
        return Result.success(selectionService.drop(studentId, classId));
    }

    private ResponseEntity<byte[]> csv(String filename, String content) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        return new ResponseEntity<>(content.getBytes(StandardCharsets.UTF_8), headers, 200);
    }
}
