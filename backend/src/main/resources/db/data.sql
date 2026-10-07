-- 由 backend/tools/generate-seed.mjs 自动生成，请勿手工修改
-- 数据来源：教学班模拟.txt（38 个教学班 / 26 门课程）、学生信息模拟.txt（40 名学生）
-- 学生初始密码统一为 123456（BCrypt）

INSERT INTO student (id, student_no, password, name) VALUES
(1, '2024010001', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '张子涵'),
(2, '2024010002', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '李思远'),
(3, '2024010003', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '王雨欣'),
(4, '2024010004', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '刘俊杰'),
(5, '2024010005', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '陈晓萌'),
(6, '2024010006', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '杨浩然'),
(7, '2024010007', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '赵雅琪'),
(8, '2024010008', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '黄子豪'),
(9, '2024010009', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '周梦瑶'),
(10, '2024010010', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '吴宇轩'),
(11, '2024010011', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '徐佳怡'),
(12, '2024010012', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '孙泽宇'),
(13, '2024010013', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '马诗涵'),
(14, '2024010014', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '朱明辉'),
(15, '2024010015', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '胡欣妍'),
(16, '2024010016', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '郭子骞'),
(17, '2024010017', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '林雨桐'),
(18, '2024010018', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '何嘉豪'),
(19, '2024010019', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '高梦琪'),
(20, '2024010020', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '罗天宇'),
(21, '2024010021', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '郑雨萱'),
(22, '2024010022', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '梁俊熙'),
(23, '2024010023', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '谢欣怡'),
(24, '2024010024', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '唐子睿'),
(25, '2024010025', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '韩雪莹'),
(26, '2024010026', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '冯浩宇'),
(27, '2024010027', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '曹思彤'),
(28, '2024010028', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '彭子豪'),
(29, '2024010029', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '董雨欣'),
(30, '2024010030', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '袁铭泽'),
(31, '2024010031', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '蒋梦洁'),
(32, '2024010032', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '余子轩'),
(33, '2024010033', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '杜雨薇'),
(34, '2024010034', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '叶俊豪'),
(35, '2024010035', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '程诗雅'),
(36, '2024010036', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '苏子涵'),
(37, '2024010037', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '吕梦婷'),
(38, '2024010038', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '魏子豪'),
(39, '2024010039', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '任雨桐'),
(40, '2024010040', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '沈嘉怡')
ON CONFLICT (id) DO NOTHING;
-- 同步序列，避免后续自增主键冲突
SELECT setval(pg_get_serial_sequence('student', 'id'), (SELECT MAX(id) FROM student));

INSERT INTO course (id, course_no, name, credit, category, college_id) VALUES
(1, 'SZ001', '思想道德与法治', 3, '通识选修课', 2),
(2, 'SZ002', '中国近现代史纲要', 3, '通识选修课', 2),
(3, 'SZ003', '马克思主义基本原理', 3, '通识选修课', 2),
(4, 'SZ004', '毛泽东思想和中国特色社会主义理论体系概论', 3, '通识选修课', 2),
(5, 'SZ005', '习近平新时代中国特色社会主义思想概论', 3, '通识选修课', 2),
(6, 'SZ006', '形势与政策', 1, '通识选修课', 2),
(7, 'CS001', '程序设计基础（C语言）', 4, '主修课程', 1),
(8, 'CS002', '数据结构与算法', 4, '主修课程', 1),
(9, 'CS003', '计算机组成原理', 3, '主修课程', 1),
(10, 'CS004', '操作系统', 4, '主修课程', 1),
(11, 'CS005', '数据库系统原理', 3, '主修课程', 1),
(12, 'CS006', '计算机网络', 3, '主修课程', 1),
(13, 'CS007', '软件工程', 3, '主修课程', 1),
(14, 'CS008', '人工智能导论', 3, '主修课程', 1),
(15, 'EN001', '大学英语（一）', 2, '英语分项', 3),
(16, 'EN002', '大学英语（二）', 2, '英语分项', 3),
(17, 'EN003', '大学英语（三）', 2, '英语分项', 3),
(18, 'EN004', '大学英语（四）', 2, '英语分项', 3),
(19, 'EN005', '英语视听说', 2, '英语分项', 3),
(20, 'EN006', '学术英语写作', 2, '英语分项', 3),
(21, 'PE001', '体育（一）', 1, '体育分项', 4),
(22, 'PE002', '体育（二）', 1, '体育分项', 4),
(23, 'PE003', '篮球', 1, '体育分项', 4),
(24, 'PE004', '羽毛球', 1, '体育分项', 4),
(25, 'PE005', '游泳', 1, '体育分项', 4),
(26, 'PE006', '太极拳', 1, '体育分项', 4)
ON CONFLICT (id) DO UPDATE SET college_id = EXCLUDED.college_id, name = EXCLUDED.name,
  credit = EXCLUDED.credit, category = EXCLUDED.category;
SELECT setval(pg_get_serial_sequence('course', 'id'), (SELECT MAX(id) FROM course));

INSERT INTO teaching_class (id, course_id, class_name, teacher, class_time, classroom, day_of_week, start_section, end_section, start_week, end_week, capacity, selected_count) VALUES
(1, 1, '01 班', '张明', '周五 3-4 节 · 1-16 周', '未定', 5, 3, 4, 1, 16, 120, 95),
(2, 1, '02 班', '李娜', '周一 1-2 节 · 1-16 周', '未定', 1, 1, 2, 1, 16, 100, 70),
(3, 2, '01 班', '李红', '周二 9-10 节 · 1-16 周', '未定', 2, 9, 10, 1, 16, 100, 58),
(4, 2, '02 班', '王强', '周三 9-10 节 · 1-16 周', '未定', 3, 9, 10, 1, 16, 90, 64),
(5, 3, '01 班', '王建国', '周三 9-10 节 · 1-16 周', '未定', 3, 9, 10, 1, 16, 110, 90),
(6, 3, '02 班', '赵敏', '周四 7-8 节 · 1-16 周', '未定', 4, 7, 8, 1, 16, 100, 94),
(7, 4, '01 班', '赵芳', '周四 9-10 节 · 1-16 周', '未定', 4, 9, 10, 1, 16, 130, 78),
(8, 4, '02 班', '陈刚', '周五 5-6 节 · 1-16 周', '未定', 5, 5, 6, 1, 16, 120, 90),
(9, 5, '01 班', '陈伟', '周二 5-6 节 · 1-16 周', '未定', 2, 5, 6, 1, 16, 150, 134),
(10, 6, '01 班', '刘洋', '周二 1-2 节 · 1-16 周', '未定', 2, 1, 2, 1, 16, 200, 132),
(11, 7, '01 班', '孙志强', '周五 1-2 节 · 1-16 周', '未定', 5, 1, 2, 1, 16, 80, 80),
(12, 7, '02 班', '李华', '周二 5-6 节 · 1-16 周', '未定', 2, 5, 6, 1, 16, 70, 41),
(13, 8, '01 班', '周敏', '周一 5-6 节 · 1-16 周', '未定', 1, 5, 6, 1, 16, 60, 46),
(14, 8, '02 班', '张涛', '周一 5-6 节 · 1-16 周', '未定', 1, 5, 6, 1, 16, 55, 51),
(15, 9, '01 班', '吴海', '周四 1-2 节 · 1-16 周', '未定', 4, 1, 2, 1, 16, 70, 56),
(16, 10, '01 班', '郑丽', '周二 5-6 节 · 1-16 周', '未定', 2, 5, 6, 1, 16, 60, 33),
(17, 10, '02 班', '王鹏', '周二 7-8 节 · 1-16 周', '未定', 2, 7, 8, 1, 16, 55, 32),
(18, 11, '01 班', '冯涛', '周三 1-2 节 · 1-16 周', '未定', 3, 1, 2, 1, 16, 75, 67),
(19, 12, '01 班', '韩雪', '周二 1-2 节 · 1-16 周', '未定', 2, 1, 2, 1, 16, 65, 54),
(20, 13, '01 班', '曹阳', '周三 5-6 节 · 1-16 周', '未定', 3, 5, 6, 1, 16, 90, 78),
(21, 14, '01 班', '谢文', '周一 1-2 节 · 1-16 周', '未定', 1, 1, 2, 1, 16, 50, 32),
(22, 14, '02 班', '刘颖', '周四 5-6 节 · 1-16 周', '未定', 4, 5, 6, 1, 16, 45, 28),
(23, 15, '01 班', '林娜', '周二 3-4 节 · 1-16 周', '未定', 2, 3, 4, 1, 16, 100, 76),
(24, 15, '02 班', '王芳', '周一 3-4 节 · 1-16 周', '未定', 1, 3, 4, 1, 16, 95, 79),
(25, 16, '01 班', '高翔', '周三 5-6 节 · 1-16 周', '未定', 3, 5, 6, 1, 16, 100, 65),
(26, 16, '02 班', '李梅', '周三 7-8 节 · 1-16 周', '未定', 3, 7, 8, 1, 16, 90, 55),
(27, 17, '01 班', '徐丽丽', '周二 5-6 节 · 1-16 周', '未定', 2, 5, 6, 1, 16, 90, 57),
(28, 18, '01 班', '何俊', '周三 7-8 节 · 1-16 周', '未定', 3, 7, 8, 1, 16, 90, 80),
(29, 19, '01 班', '马晓燕', '周一 5-6 节 · 1-16 周', '未定', 1, 5, 6, 1, 16, 60, 45),
(30, 20, '01 班', '董倩', '周五 9-10 节 · 1-16 周', '未定', 5, 9, 10, 1, 16, 45, 45),
(31, 21, '01 班', '杨刚', '周二 1-2 节 · 1-16 周', '未定', 2, 1, 2, 1, 16, 120, 107),
(32, 21, '02 班', '刘强', '周一 9-10 节 · 1-16 周', '未定', 1, 9, 10, 1, 16, 110, 84),
(33, 22, '01 班', '朱强', '周二 9-10 节 · 1-16 周', '未定', 2, 9, 10, 1, 16, 120, 107),
(34, 23, '01 班', '方勇', '周四 5-6 节 · 1-16 周', '未定', 4, 5, 6, 1, 16, 50, 46),
(35, 23, '02 班', '张磊', '周五 3-4 节 · 1-16 周', '未定', 5, 3, 4, 1, 16, 45, 25),
(36, 24, '01 班', '潘婷', '周一 9-10 节 · 1-16 周', '未定', 1, 9, 10, 1, 16, 40, 40),
(37, 25, '01 班', '石磊', '周四 3-4 节 · 1-16 周', '未定', 4, 3, 4, 1, 16, 35, 28),
(38, 26, '01 班', '卢静', '周一 7-8 节 · 1-16 周', '未定', 1, 7, 8, 1, 16, 60, 33)
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('teaching_class', 'id'), (SELECT MAX(id) FROM teaching_class));

INSERT INTO college (id, name) VALUES
(1, '计算机学院'),
(2, '马克思主义学院'),
(3, '外国语学院'),
(4, '体育部')
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('college', 'id'), (SELECT MAX(id) FROM college));

INSERT INTO admin (id, admin_no, password, name) VALUES
(1, 'admin', '$2a$10$4Xdz9czbVZGTg5XzRqTRWOGK1RgR2q98zRHJCynk1m5dDwlehJJya', '教务管理员')
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('admin', 'id'), (SELECT MAX(id) FROM admin));
