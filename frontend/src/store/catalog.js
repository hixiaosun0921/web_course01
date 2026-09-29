import { defineStore } from 'pinia';
import { listCourses, refreshAvailability, fetchAvailability } from '../api/course';
import { useSelectionStore } from './selection';
import { conflictOf } from '../utils/conflict';
import { toast } from '../composables/toast';

export const SORT_LABELS = {
  remaining: '余量从多到少',
  credit: '学分从高到低',
  courseNo: '课程编号',
  teacher: '任课教师',
  time: '上课时间'
};

function defaultFilters() {
  return {
    keyword: '',
    category: '主修课程',
    onlyAvailable: true,
    onlyNoConflict: true,
    teacher: '',
    day: 0,
    section: 0,
    sortBy: 'remaining'
  };
}

function maxRemain(item) {
  return Math.max(...item.classes.map(cls => cls.remaining));
}

function sortClasses(list, sortBy, chosenSet, waitlistMap) {
  const byRemain = (a, b) => b.remaining - a.remaining;
  const compare = {
    remaining: byRemain,
    credit: byRemain,
    courseNo: (a, b) => a.className.localeCompare(b.className, 'zh'),
    teacher: (a, b) => a.teacher.localeCompare(b.teacher, 'zh'),
    time: (a, b) => (a.day * 100 + a.start) - (b.day * 100 + b.start)
  }[sortBy] || byRemain;

  list.sort((a, b) => {
    const pinA = chosenSet.has(a.classId) || waitlistMap.has(a.classId) ? 1 : 0;
    const pinB = chosenSet.has(b.classId) || waitlistMap.has(b.classId) ? 1 : 0;
    return pinB - pinA || compare(a, b);
  });
}

function sortCourses(list, sortBy, chosenSet, waitlistMap) {
  const byRemain = (a, b) => maxRemain(b) - maxRemain(a);
  const compare = {
    remaining: (a, b) => byRemain(a, b) || a.courseId.localeCompare(b.courseId),
    credit: (a, b) => b.credit - a.credit || byRemain(a, b),
    courseNo: (a, b) => a.courseId.localeCompare(b.courseId),
    teacher: (a, b) => a.classes[0].teacher.localeCompare(b.classes[0].teacher, 'zh'),
    time: (a, b) => (a.classes[0].day * 100 + a.classes[0].start) - (b.classes[0].day * 100 + b.classes[0].start)
  }[sortBy] || byRemain;

  list.sort((a, b) => {
    const pinA = a.classes.some(cls => chosenSet.has(cls.classId) || waitlistMap.has(cls.classId)) ? 1 : 0;
    const pinB = b.classes.some(cls => chosenSet.has(cls.classId) || waitlistMap.has(cls.classId)) ? 1 : 0;
    return pinB - pinA || compare(a, b);
  });
  list.forEach(item => sortClasses(item.classes, sortBy, chosenSet, waitlistMap));
}

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    courses: [],
    loading: false,
    lastRefresh: null,
    expanded: [],
    filters: defaultFilters()
  }),
  getters: {
    classMap(state) {
      const map = new Map();
      state.courses.forEach(course => {
        course.classes.forEach(cls => {
          map.set(cls.classId, {
            ...cls,
            courseId: course.courseId,
            courseName: course.name,
            credit: course.credit,
            category: course.category
          });
        });
      });
      return map;
    },

    visibleCourses(state) {
      const selection = useSelectionStore();
      const classMap = this.classMap;
      const chosenSet = selection.chosenSet;
      const waitlistMap = selection.waitlistMap;
      const filters = state.filters;
      const keyword = filters.keyword.trim().toLowerCase();

      const keywordHit = (course, cls) => {
        if (!keyword) return true;
        if (course.courseId.toLowerCase().includes(keyword) || course.name.toLowerCase().includes(keyword)) return true;
        return cls.className.toLowerCase().includes(keyword) || cls.teacher.toLowerCase().includes(keyword);
      };
      const extraHit = cls => {
        if (filters.teacher && !cls.teacher.includes(filters.teacher)) return false;
        if (filters.day && cls.day !== filters.day) return false;
        if (filters.section && !(cls.start <= filters.section + 1 && cls.end >= filters.section)) return false;
        return true;
      };

      const list = [];
      state.courses.forEach(course => {
        if (course.category !== filters.category) return;
        const classes = course.classes.filter(cls => {
          if (!keywordHit(course, cls) || !extraHit(cls)) return false;
          const pinned = chosenSet.has(cls.classId) || waitlistMap.has(cls.classId);
          if (pinned) return true;
          if (filters.onlyAvailable && cls.remaining <= 0) return false;
          if (filters.onlyNoConflict && conflictOf(cls, chosenSet, classMap)) return false;
          return true;
        }).map(cls => ({ ...cls, conflict: conflictOf(cls, chosenSet, classMap) }));

        if (classes.length) list.push({ ...course, classes, classCount: course.classes.length });
      });

      sortCourses(list, filters.sortBy, chosenSet, waitlistMap);
      return list;
    },

    allVisibleExpanded() {
      const list = this.visibleCourses;
      return list.length > 0 && list.every(item => this.expanded.includes(item.courseId));
    }
  },
  actions: {
    async loadCourses() {
      this.loading = true;
      try {
        this.courses = await listCourses();
        if (!this.expanded.length && this.courses.length) {
          /* 默认展开当前类别的前两门课程 */
          this.expanded = this.courses
            .filter(course => course.category === this.filters.category)
            .slice(0, 2)
            .map(course => course.courseId);
        }
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        this.loading = false;
      }
    },

    /* 手动/自动刷新余量（POST 会模拟其他学生选退课） */
    async refresh(manual = false) {
      try {
        const list = await refreshAvailability();
        this.applyAvailability(list);
        this.lastRefresh = new Date();
        if (manual) toast('余量已刷新', 'success');
      } catch (err) {
        if (manual) toast(err.message, 'error');
      }
    },

    /* 按服务端最新数据同步余量（不触发模拟波动） */
    async syncAvailability() {
      try {
        const list = await fetchAvailability();
        this.applyAvailability(list);
      } catch (err) {
        toast(err.message, 'error');
      }
    },

    applyAvailability(list) {
      const map = new Map(list.map(item => [item.classId, item]));
      this.courses.forEach(course => {
        course.classes.forEach(cls => {
          const item = map.get(cls.classId);
          if (item) {
            cls.selected = item.selected;
            cls.remaining = item.remaining;
          }
        });
      });
    },

    applyClassState({ classId, selected, remaining }) {
      this.courses.forEach(course => {
        course.classes.forEach(cls => {
          if (cls.classId === classId) {
            cls.selected = selected;
            cls.remaining = remaining;
          }
        });
      });
    },

    toggleExpand(courseId) {
      if (this.expanded.includes(courseId)) {
        this.expanded = this.expanded.filter(id => id !== courseId);
      } else {
        this.expanded.push(courseId);
      }
    },

    toggleExpandAll() {
      const list = this.visibleCourses;
      if (!list.length) return;
      if (this.allVisibleExpanded) {
        const visible = new Set(list.map(item => item.courseId));
        this.expanded = this.expanded.filter(id => !visible.has(id));
      } else {
        const set = new Set(this.expanded);
        list.forEach(item => set.add(item.courseId));
        this.expanded = Array.from(set);
      }
    },

    resetFilters() {
      this.filters = {
        ...defaultFilters(),
        category: this.filters.category,
        sortBy: this.filters.sortBy
      };
    }
  }
});
