
import { StudentSummary, UniversitySchema } from '../types';

export const MOCK_STUDENTS: StudentSummary[] = [
  {
    id: '1',
    name: 'Alex Chen',
    studentId: '2025001',
    grade: 'G11',
    class: '11-A',
    direction: 'US',
    phase: 'Phase 2 教学运营',
    status: '规划中',
    targetSummary: 'US Top 30 CS',
    riskLevel: 'high',
    riskCategories: ['成绩风险'],
    riskTags: ['GPA波动', '托福未达标'],
    nextTask: '选校名单确认',
    nextTaskDue: 'Today',
    lastContact: '3 days ago',
    dataCompleteness: 85,
    avatarInitials: 'AC',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Alex&backgroundColor=ffdfbf'
  },
  // ... 其他学生数据可以在此继续添加
];

export const SCHOOL_DATABASE: UniversitySchema[] = [
  { id: 'u1', name: 'Carnegie Mellon University', cnName: '卡内基梅隆', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CMU&backgroundColor=b91c1c', rank: 22, region: 'US', tags: ['CS #1', 'STEM强'], avgGpa: 3.92, minToefl: 102, avgSat: 1560 },
  { id: 'u2', name: 'New York University', cnName: '纽约大学', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=NYU&backgroundColor=57068c', rank: 35, region: 'US', tags: ['商科强', '城市校园'], avgGpa: 3.8, minToefl: 100, avgSat: 1520 },
  // ... 其他院校数据
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: '首页', path: '/teacher/dashboard' },
  { id: 'students', label: '学生管理', path: '/teacher/students' },
  { id: 'tasks', label: '任务中心', path: '/teacher/tasks' },
  { id: 'knowledge', label: '知识库', path: '/teacher/knowledge' },
  { id: 'reports', label: '报告中心', path: '/teacher/reports' },
  { id: 'review', label: '复盘报表', path: '/teacher/review' },
];
