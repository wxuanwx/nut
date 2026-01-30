
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import FeedbackModal from './components/common/FeedbackModal';
import './App.scss';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <FeedbackModal />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
