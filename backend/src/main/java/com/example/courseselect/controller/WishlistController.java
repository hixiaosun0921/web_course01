package com.example.courseselect.controller;

import com.example.courseselect.common.Result;
import com.example.courseselect.dto.SelectDTO;
import com.example.courseselect.interceptor.AuthInterceptor;
import com.example.courseselect.service.WishlistService;
import com.example.courseselect.vo.WishVO;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishes")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public Result<WishVO> list(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId) {
        return Result.success(wishlistService.list(studentId));
    }

    @PostMapping
    public Result<WishVO> add(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId,
                              @RequestBody SelectDTO dto) {
        return Result.success(wishlistService.add(studentId, dto.teachingClassId()));
    }

    @DeleteMapping("/{teachingClassId}")
    public Result<WishVO> remove(@RequestAttribute(AuthInterceptor.ATTR_STUDENT_ID) Long studentId,
                                 @PathVariable Long teachingClassId) {
        return Result.success(wishlistService.remove(studentId, teachingClassId));
    }
}
