/* 时间冲突判定（BR-03 / BR-06）：前后端算法保持一致 */
export function hasTimeConflict(a, b) {
  return a.day === b.day
    && a.start <= b.end && a.end >= b.start
    && a.startWeek <= b.endWeek && a.endWeek >= b.startWeek;
}

/* 返回与 cls 冲突的已选教学班（无则 null） */
export function conflictOf(cls, chosenIds, classMap) {
  for (const id of chosenIds) {
    if (id === cls.classId) continue;
    const other = classMap.get(id);
    if (other && hasTimeConflict(other, cls)) return other;
  }
  return null;
}
