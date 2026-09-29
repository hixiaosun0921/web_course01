import { defineStore } from 'pinia';
import { listSelections, selectCourse, dropCourse, batchCancel } from '../api/selection';
import { listWishes, addWish, removeWish } from '../api/wish';
import { listWaitlist, joinWaitlist as joinWaitlistApi, leaveWaitlist as leaveWaitlistApi } from '../api/waitlist';
import { useCatalogStore } from './catalog';
import { toast } from '../composables/toast';

export const useSelectionStore = defineStore('selection', {
  state: () => ({
    classIds: [],
    waitlist: [],  // [{ classId, position }]
    wishes: [],    // [classId]
    batch: [],     // 批量退课勾选
    credit: 0,
    count: 0,
    loading: false
  }),
  getters: {
    chosenSet: state => new Set(state.classIds),
    waitlistMap: state => new Map(state.waitlist.map(item => [item.classId, item.position])),
    wishSet: state => new Set(state.wishes),
    chosenClasses() {
      const catalog = useCatalogStore();
      return this.classIds.map(id => catalog.classMap.get(id)).filter(Boolean);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        const [selection, waitlist, wishes] = await Promise.all([listSelections(), listWaitlist(), listWishes()]);
        this.classIds = selection.classIds;
        this.credit = selection.credit;
        this.count = selection.count;
        this.waitlist = waitlist.list;
        this.wishes = wishes.classIds;
      } finally {
        this.loading = false;
      }
    },

    applySelectResult(classId, result) {
      const catalog = useCatalogStore();
      if (!this.classIds.includes(classId)) this.classIds.push(classId);
      this.credit = result.credit;
      this.count = result.count;
      this.batch = this.batch.filter(id => id !== classId);
      this.wishes = this.wishes.filter(id => id !== classId);
      catalog.applyClassState(result);
    },

    async select(classId, silent = false) {
      const catalog = useCatalogStore();
      try {
        const result = await selectCourse(classId);
        this.applySelectResult(classId, result);
        if (!silent) {
          const cls = catalog.classMap.get(classId);
          toast(`选课成功：${cls ? `《${cls.courseName}》${cls.className}` : ''}`, 'success');
        }
        return true;
      } catch (err) {
        if (!silent) toast(err.message, 'error');
        return false;
      }
    },

    async drop(classId) {
      const catalog = useCatalogStore();
      try {
        const result = await dropCourse(classId);
        this.classIds = this.classIds.filter(id => id !== classId);
        this.credit = result.credit;
        this.count = result.count;
        this.batch = this.batch.filter(id => id !== classId);
        catalog.applyClassState(result);
        const cls = catalog.classMap.get(classId);
        toast(`已退选：${cls ? `《${cls.courseName}》${cls.className}` : ''}`, 'success');
        return true;
      } catch (err) {
        toast(err.message, 'error');
        return false;
      }
    },

    async batchDrop() {
      const ids = [...this.batch];
      if (!ids.length) return;
      try {
        const data = await batchCancel(ids);
        const success = data.results.filter(item => item.success).length;
        const failed = data.results.filter(item => !item.success);
        this.classIds = this.classIds.filter(id => !ids.includes(id));
        this.credit = data.credit;
        this.count = data.count;
        this.batch = [];
        const catalog = useCatalogStore();
        catalog.syncAvailability();
        const failedText = failed.length ? `，失败 ${failed.length} 个（${failed[0].reason}）` : '';
        toast(`批量退课完成：成功退选 ${success} 个教学班${failedText}`, success ? 'success' : 'error');
      } catch (err) {
        toast(err.message, 'error');
      }
    },

    async joinWaitlist(classId) {
      const catalog = useCatalogStore();
      try {
        const data = await joinWaitlistApi(classId);
        this.waitlist.push({ classId, position: data.position });
        const cls = catalog.classMap.get(classId);
        toast(`已加入候补：${cls ? `《${cls.courseName}》${cls.className}` : ''}，当前第 ${data.position} 位`, 'success');
        return true;
      } catch (err) {
        toast(err.message, 'error');
        return false;
      }
    },

    async leaveWaitlist(classId) {
      try {
        await leaveWaitlistApi(classId);
        this.waitlist = this.waitlist.filter(item => item.classId !== classId);
        toast('已退出候补', 'info');
      } catch (err) {
        toast(err.message, 'error');
      }
    },

    async toggleWish(classId) {
      try {
        if (this.wishes.includes(classId)) {
          const data = await removeWish(classId);
          this.wishes = data.classIds;
          toast('已移出意向单', 'info');
        } else {
          const data = await addWish(classId);
          this.wishes = data.classIds;
          toast('已加入意向单', 'success');
        }
      } catch (err) {
        toast(err.message, 'error');
      }
    },

    /* 一键选课：逐条执行并汇总结果（FR-13） */
    async wishSelectAll() {
      const ids = [...this.wishes];
      if (!ids.length) {
        toast('意向单为空', 'info');
        return;
      }
      let ok = 0;
      let fail = 0;
      for (const id of ids) {
        const success = await this.select(id, true);
        if (success) ok += 1;
        else fail += 1;
      }
      toast(`一键选课完成：成功 ${ok} 个${fail ? `，失败 ${fail} 个` : ''}`, ok ? 'success' : 'error');
    },

    toggleBatch(classId, checked) {
      if (checked) {
        if (!this.batch.includes(classId)) this.batch.push(classId);
      } else {
        this.batch = this.batch.filter(id => id !== classId);
      }
    },

    clearBatch() {
      this.batch = [];
    }
  }
});
