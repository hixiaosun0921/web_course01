package com.example.courseselect.service;

import com.example.courseselect.mapper.ClassMapper;
import com.example.courseselect.mapper.SelectionMapper;
import com.example.courseselect.mapper.row.ClassCountRow;
import com.example.courseselect.mapper.row.ClassRow;
import com.example.courseselect.util.NumberUtil;
import com.example.courseselect.vo.AvailabilityVO;
import com.example.courseselect.vo.CourseVO;
import com.example.courseselect.vo.TeachingClassVO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class CourseService {

    private final ClassMapper classMapper;
    private final SelectionMapper selectionMapper;
    private final Random random = new Random();

    public CourseService(ClassMapper classMapper, SelectionMapper selectionMapper) {
        this.classMapper = classMapper;
        this.selectionMapper = selectionMapper;
    }

    /** 课程 + 教学班列表（FR-05） */
    public List<CourseVO> listCourses() {
        List<ClassRow> rows = classMapper.findAllWithCourse();
        Map<String, List<ClassRow>> grouped = new LinkedHashMap<>();
        for (ClassRow row : rows) {
            grouped.computeIfAbsent(row.getCourseNo(), key -> new ArrayList<>()).add(row);
        }
        List<CourseVO> result = new ArrayList<>();
        grouped.forEach((courseNo, list) -> {
            ClassRow first = list.get(0);
            List<TeachingClassVO> classes = list.stream().map(this::toClassVO).toList();
            result.add(new CourseVO(
                    courseNo,
                    first.getCourseName(),
                    NumberUtil.normalizeCredit(first.getCredit()),
                    first.getCategory(),
                    classes.size(),
                    classes));
        });
        return result;
    }

    /** 批量余量查询（FR-12） */
    public List<AvailabilityVO> availability() {
        return classMapper.findAllWithCourse().stream()
                .map(row -> new AvailabilityVO(
                        row.getClassId(),
                        row.getSelectedCount(),
                        Math.max(0, row.getCapacity() - row.getSelectedCount())))
                .toList();
    }

    /**
     * 模拟其他学生选退课引起的余量波动（演示用）
     * 不低于该教学班真实选课人数，不高于容量
     */
    public List<AvailabilityVO> refreshAvailability() {
        Map<Long, Integer> actual = new HashMap<>();
        for (ClassCountRow row : selectionMapper.countGroupByClass()) {
            actual.put(row.getClassId(), row.getCnt());
        }
        for (ClassRow row : classMapper.findAllWithCourse()) {
            if (random.nextDouble() > 0.3) {
                continue;
            }
            int min = actual.getOrDefault(row.getClassId(), 0);
            int delta = random.nextBoolean() ? 1 : -1;
            int next = Math.min(row.getCapacity(), Math.max(min, row.getSelectedCount() + delta));
            if (next != row.getSelectedCount()) {
                classMapper.updateSelectedCount(row.getClassId(), next);
            }
        }
        return availability();
    }

    private TeachingClassVO toClassVO(ClassRow row) {
        return new TeachingClassVO(
                row.getClassId(),
                row.getClassName(),
                row.getTeacher(),
                row.getClassroom(),
                row.getClassTime(),
                row.getDayOfWeek(),
                row.getStartSection(),
                row.getEndSection(),
                row.getStartWeek(),
                row.getEndWeek(),
                row.getCapacity(),
                row.getSelectedCount(),
                Math.max(0, row.getCapacity() - row.getSelectedCount()));
    }
}
