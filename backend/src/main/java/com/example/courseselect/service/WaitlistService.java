package com.example.courseselect.service;

import com.example.courseselect.common.BusinessException;
import com.example.courseselect.common.ErrorCode;
import com.example.courseselect.mapper.ClassMapper;
import com.example.courseselect.mapper.SelectionMapper;
import com.example.courseselect.mapper.WaitlistMapper;
import com.example.courseselect.mapper.row.ClassRow;
import com.example.courseselect.mapper.row.WaitlistRow;
import com.example.courseselect.util.NumberUtil;
import com.example.courseselect.util.TimeConflictUtil;
import com.example.courseselect.vo.WaitlistItemVO;
import com.example.courseselect.vo.WaitlistVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WaitlistService {

    private final ClassMapper classMapper;
    private final SelectionMapper selectionMapper;
    private final WaitlistMapper waitlistMapper;

    @Value("${app.credit-max}")
    private int creditMax;

    public WaitlistService(ClassMapper classMapper,
                           SelectionMapper selectionMapper,
                           WaitlistMapper waitlistMapper) {
        this.classMapper = classMapper;
        this.selectionMapper = selectionMapper;
        this.waitlistMapper = waitlistMapper;
    }

    /** 申请候补（FR-14）：仅满员可申请，校验与选课一致 */
    @Transactional
    public WaitlistItemVO join(Long studentId, Long classId) {
        ClassRow target = classId == null ? null : classMapper.findById(classId);
        if (target == null) {
            throw new BusinessException(ErrorCode.CLASS_NOT_FOUND, "教学班不存在");
        }
        if (selectionMapper.countSelection(studentId, classId) > 0) {
            throw new BusinessException(ErrorCode.DUPLICATE_SELECTION, "已选该教学班，无需候补");
        }
        if (waitlistMapper.countWaiting(studentId, classId) > 0) {
            throw new BusinessException(ErrorCode.WAITLIST_DUPLICATE, "已在候补队列中");
        }

        List<ClassRow> mine = selectionMapper.findRowsByStudent(studentId);
        for (ClassRow row : mine) {
            if (row.getCourseIdDb().equals(target.getCourseIdDb())) {
                throw new BusinessException(ErrorCode.DUPLICATE_SELECTION,
                        "已选《" + row.getCourseName() + "》" + row.getClassName() + "，同一课程只能选一个教学班");
            }
        }
        for (ClassRow row : mine) {
            if (TimeConflictUtil.conflict(row, target)) {
                throw new BusinessException(ErrorCode.TIME_CONFLICT,
                        "与已选《" + row.getCourseName() + "》" + row.getClassName()
                                + "（" + TimeConflictUtil.timeText(row) + "）时间冲突");
            }
        }
        BigDecimal credit = selectionMapper.sumCredit(studentId);
        if (credit.add(NumberUtil.normalizeCredit(target.getCredit()))
                .compareTo(BigDecimal.valueOf(creditMax)) > 0) {
            throw new BusinessException(ErrorCode.CREDIT_LIMIT, "超出学分上限 " + creditMax + " 学分");
        }
        if (target.getSelectedCount() < target.getCapacity()) {
            throw new BusinessException(ErrorCode.CLASS_AVAILABLE, "该教学班尚有余量，请直接选课");
        }

        int position = waitlistMapper.nextPosition(classId);
        waitlistMapper.insert(studentId, classId, position);
        return new WaitlistItemVO(classId, position);
    }

    @Transactional
    public void leave(Long studentId, Long classId) {
        if (classId == null || waitlistMapper.deleteWaiting(studentId, classId) == 0) {
            throw new BusinessException(ErrorCode.WAITLIST_NOT_FOUND, "候补不存在或已失效");
        }
    }

    public WaitlistVO list(Long studentId) {
        List<WaitlistItemVO> items = waitlistMapper.findWaitingByStudent(studentId).stream()
                .map(row -> new WaitlistItemVO(row.getClassId(), row.getPosition()))
                .toList();
        return new WaitlistVO(items);
    }
}
