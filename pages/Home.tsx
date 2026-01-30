
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentOverview from '../components/teacher/StudentOverview';
import RiskCard from '../components/teacher/RiskCard';
import TaskList from '../components/teacher/TaskList';
import ReviewSnapshot from '../components/teacher/ReviewSnapshot';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          早安，{user?.name.split(' ')[0]} ☕️
        </h1>
        <p className="text-sm text-gray-500 mt-1">这是您今日的升学指导业务概览。</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <StudentOverview />
          <RiskCard onRiskClick={(type) => navigate(`/teacher/students?filter=${type}`)} />
        </div>
        <div className="space-y-6">
          <TaskList onViewAll={() => navigate('/teacher/tasks')} />
          <ReviewSnapshot onDetailClick={() => navigate('/teacher/review')} />
        </div>
      </div>
    </div>
  );
};

export default Home;
