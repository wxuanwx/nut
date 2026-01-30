
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-black text-primary-600 mb-4">关于 Nut Project</h1>
      <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
        Nut Project 是专为国际学校升学指导部门打造的企业级管理系统，
        通过 AI 赋能、数据驱动，全方位提升升学规划与申请管理的效率。
      </p>
    </div>
  );
};

export default About;
