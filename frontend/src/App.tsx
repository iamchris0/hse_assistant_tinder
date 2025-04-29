import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Questionnaire from './pages/Questionnaire';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Search from './pages/Search';
import AccountSettings from './pages/AccountSettings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkQuestionnaire = async () => {
      try {
        const response = await fetch(`/api/students/${user?.id}/questionnaire`);
        const data = await response.json();
        setQuestionnaireCompleted(data.questionnaire_completed);
      } catch (error) {
        console.error('Error checking questionnaire status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'student') {
      checkQuestionnaire();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user?.role === 'student' && !questionnaireCompleted) {
    return <Navigate to="/questionnaire" />;
  }

  return <>{children}</>;
};

const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'teacher') {
    return <Navigate to="/groups" />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Route for questionnaire */}
      <Route 
        path="/questionnaire" 
        element={
          <ProtectedRoute>
            <Questionnaire />
          </ProtectedRoute>
        } 
      />
      
      {/* Teacher dashboard route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <TeacherRoute>
              {user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/groups" />}
            </TeacherRoute>
          </ProtectedRoute>
        } 
      />
      
      {/* Student dashboard route with StudentRoute protecting it */}
      <Route 
        path="/groups" 
        element={
          <ProtectedRoute>
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/search" 
        element={
          <ProtectedRoute>
            <TeacherRoute>
              <Search />
            </TeacherRoute>
          </ProtectedRoute>
        } 
      />

      {/* Account Settings route */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;