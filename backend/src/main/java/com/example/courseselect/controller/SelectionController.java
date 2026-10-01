package com.example.courseselect.controller;

import com.example.courseselect.common.Result;
import com.example.courseselect.dto.BatchCancelDTO;
import com.example.courseselect.dto.SelectDTO;
import com.example.courseselect.interceptor.AuthInterceptor;
import com.example.courseselect.service.SelectionService;
import com.example.courseselect.vo.BatchResultVO;
import com.example.courseselect.vo.SelectResultVO;
import com.example.courseselect.vo.SelectionsVO;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/selections")
public class SelectionController {

    private final SelectionService selectionService;

    public SelectionController(SelectionService selectionService) {
        this.selectionService = selectionService;
    }

    @GetMapping
    public Result<SelectionsVO> list(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId) {
        return Result.success(selectionService.getSelections(studentId));
    }

    @PostMapping
    public Result<SelectResultVO> select(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId,
                                         @RequestBody SelectDTO dto) {
        return Result.success(selectionService.select(studentId, dto.teachingClassId()));
    }

    @DeleteMapping("/{teachingClassId}")
    public Result<SelectResultVO> drop(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId,
                                       @PathVariable Long teachingClassId) {
        return Result.success(selectionService.drop(studentId, teachingClassId));
    }

    @PostMapping("/batch-cancel")
    public Result<BatchResultVO> batchCancel(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId,
                                             @RequestBody BatchCancelDTO dto) {
        return Result.success(selectionService.batchCancel(studentId, dto.teachingClassIds()));
    }
}
