package com.example.courseselect.service;

import com.example.courseselect.common.BusinessException;
import com.example.courseselect.common.ErrorCode;
import com.example.courseselect.mapper.ClassMapper;
import com.example.courseselect.mapper.SelectionMapper;
import com.example.courseselect.mapper.WishMapper;
import com.example.courseselect.mapper.row.ClassRow;
import com.example.courseselect.util.NumberUtil;
import com.example.courseselect.util.TimeConflictUtil;
import com.example.courseselect.vo.BatchResultVO;
import com.example.courseselect.vo.SelectResultVO;
import com.example.courseselect.vo.SelectionVO;
import com.example.courseselect.vo.SelectionsVO;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class SelectionService {

    private final ClassMapper classMapper;
    private final SelectionMapper selectionMapper;
    private final WishMapper wishMapper;
    private final ObjectProvider<SelectionService> selfProvider;

    @Value("${app.credit-max}")
    private int creditMax;

    public SelectionService(ClassMapper classMapper,
                            SelectionMapper selectionMapper,
                            WishMapper wishMapper,
                            ObjectProvider<SelectionService> selfProvider) {
        this.classMapper = classMapper;
        this.selectionMapper = selectionMapper;
        this.wishMapper = wishMapper;
        this.selfProvider = selfProvider;
    }

    /**
     * 选课（FR-06）：重复校验 → 同课程互斥 → 名额原子扣减 → 时间冲突 → 学分上限
     * 任一失败整体回滚（名额自动释放）
     */
    @Transactional
    public SelectResultVO select(Long studentId, Long classId) {
        if (classId == null) {
            throw new BusinessException(ErrorCode.CLASS_NOT_FOUND, "教学班不存在");
        }
        ClassRow target = classMapper.findById(classId);
        if (target == null) {
            throw new BusinessException(ErrorCode.CLASS_NOT_FOUND, "教学班不存在");
        }
        if (selectionMapper.countSelection(studentId, classId) > 0) {
            throw new BusinessException(ErrorCode.DUPLICATE_SELECTION, "已选该教学班");
        }

        List<ClassRow> mine = selectionMapper.findRowsByStudent(studentId);
        for (ClassRow row : mine) {
            if (row.getCourseIdDb().equals(target.getCourseIdDb())) {
                throw new BusinessException(ErrorCode.DUPLICATE_SELECTION,
                        "已选《" + row.getCourseName() + "》" + row.getClassName() + "，同一课程只能选一个教学班");
            }
        }

        if (classMapper.incrementIfAvailable(classId) == 0) {
            throw new BusinessException(ErrorCode.CLASS_FULL, "该教学班已满，可加入候补");
        }

        for (ClassRow row : mine) {
            if (TimeConflictUtil.conflict(row, target)) {
                throw new BusinessException(ErrorCode.TIME_CONFLICT,
                        "与已选《" + row.getCourseName() + "》" + row.getClassName()
                                + "（" + TimeConflictUtil.timeText(row) + "）时间冲突");
            }
        }

        BigDecimal credit = selectionMapper.sumCredit(studentId);
        BigDecimal after = credit.add(NumberUtil.normalizeCredit(target.getCredit()));
        if (after.compareTo(BigDecimal.valueOf(creditMax)) > 0) {
            throw new BusinessException(ErrorCode.CREDIT_LIMIT,
                    "超出学分上限 " + creditMax + " 学分，当前已选 " + NumberUtil.normalizeCredit(credit) + " 学分");
        }

        selectionMapper.insert(studentId, classId);
        wishMapper.delete(studentId, classId);
        return resultOf(studentId, classId);
    }

    /** 退课（FR-07）：删除记录 + 名额递减，同一事务 */
    @Transactional
    public SelectResultVO drop(Long studentId, Long classId) {
        if (classId == null || selectionMapper.countSelection(studentId, classId) == 0) {
            throw new BusinessException(ErrorCode.NOT_SELECTED, "未选该教学班");
        }
        selectionMapper.delete(studentId, classId);
        classMapper.decrement(classId);
        return resultOf(studentId, classId);
    }

    /** 批量退课（BR-10）：逐条独立事务，返回结果明细，部分失败不影响已成功项 */
    public BatchResultVO batchCancel(Long studentId, List<Long> classIds) {
        SelectionService self = selfProvider.getObject();
        List<BatchResultVO.Item> results = new ArrayList<>();
        for (Long classId : classIds == null ? List.<Long>of() : classIds) {
            try {
                self.drop(studentId, classId);
                results.add(new BatchResultVO.Item(classId, true, null));
            } catch (BusinessException ex) {
                results.add(new BatchResultVO.Item(classId, false, ex.getMessage()));
            }
        }
        return new BatchResultVO(results,
                NumberUtil.normalizeCredit(selectionMapper.sumCredit(studentId)),
                selectionMapper.findClassIds(studentId).size());
    }

    /** 已选课程明细 + 学分统计（FR-08） */
    public SelectionsVO getSelections(Long studentId) {
        List<ClassRow> rows = selectionMapper.findRowsByStudent(studentId);
        List<SelectionVO> list = rows.stream().map(this::toSelectionVO).toList();
        BigDecimal credit = BigDecimal.ZERO;
        for (ClassRow row : rows) {
            credit = credit.add(NumberUtil.normalizeCredit(row.getCredit()));
        }
        return new SelectionsVO(
                rows.stream().map(ClassRow::getClassId).toList(),
                NumberUtil.normalizeCredit(credit),
                rows.size(),
                list);
    }

    private SelectResultVO resultOf(Long studentId, Long classId) {
        ClassRow row = classMapper.findById(classId);
        int selected = row == null ? 0 : row.getSelectedCount();
        int remaining = row == null ? 0 : Math.max(0, row.getCapacity() - row.getSelectedCount());
        return new SelectResultVO(
                classId,
                selected,
                remaining,
                NumberUtil.normalizeCredit(selectionMapper.sumCredit(studentId)),
                selectionMapper.findClassIds(studentId).size());
    }

    private SelectionVO toSelectionVO(ClassRow row) {
        return new SelectionVO(
                row.getClassId(),
                row.getCourseNo(),
                row.getCourseName(),
                row.getClassName(),
                row.getTeacher(),
                row.getClassroom(),
                NumberUtil.normalizeCredit(row.getCredit()),
                row.getCategory(),
                row.getDayOfWeek(),
                row.getStartSection(),
                row.getEndSection(),
                row.getStartWeek(),
                row.getEndWeek(),
                TimeConflictUtil.timeText(row));
    }
}
