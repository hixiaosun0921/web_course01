package com.example.courseselect.service;

import com.example.courseselect.common.BusinessException;
import com.example.courseselect.common.ErrorCode;
import com.example.courseselect.mapper.ClassMapper;
import com.example.courseselect.mapper.WishMapper;
import com.example.courseselect.vo.WishVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    private final ClassMapper classMapper;
    private final WishMapper wishMapper;

    @Value("${app.wish-max}")
    private int wishMax;

    public WishlistService(ClassMapper classMapper, WishMapper wishMapper) {
        this.classMapper = classMapper;
        this.wishMapper = wishMapper;
    }

    /** 加入意向单（FR-13）：不占容量，仅收藏 */
    public WishVO add(Long studentId, Long classId) {
        if (classId == null || classMapper.findById(classId) == null) {
            throw new BusinessException(ErrorCode.CLASS_NOT_FOUND, "教学班不存在");
        }
        List<Long> current = wishMapper.findClassIds(studentId);
        if (!current.contains(classId) && current.size() >= wishMax) {
            throw new BusinessException(ErrorCode.WISH_LIMIT, "意向单最多收藏 " + wishMax + " 个教学班");
        }
        wishMapper.insert(studentId, classId);
        return new WishVO(wishMapper.findClassIds(studentId));
    }

    public WishVO remove(Long studentId, Long classId) {
        wishMapper.delete(studentId, classId);
        return new WishVO(wishMapper.findClassIds(studentId));
    }

    public WishVO list(Long studentId) {
        return new WishVO(wishMapper.findClassIds(studentId));
    }
}
