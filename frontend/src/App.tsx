import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import OperatorDashboard from './pages/OperatorDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import PlantLayoutPage from './pages/PlantLayoutPage';
import SensorDashboardPage from './pages/SensorDashboardPage';
import AnomalyIntelligencePage from './pages/AnomalyIntelligencePage';
import IncidentManagementPage from './pages/IncidentManagementPage';
import SimulationPage from './pages/SimulationPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AIAssistantPage from './pages/AIAssistantPage';
// Simple protected route component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes based on RBAC */}
        <Route 
          path="/operator-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['operator', 'engineer', 'admin']}>
              <OperatorDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/plant-layout" 
          element={
            <ProtectedRoute allowedRoles={['operator', 'engineer', 'admin']}>
              <PlantLayoutPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sensors" 
          element={
            <ProtectedRoute allowedRoles={['operator', 'engineer', 'admin']}>
               <SensorDashboardPage />
            </ProtectedRoute>
       } 
        />
          <Route 
     path="/anomalies" 
     element={
       <ProtectedRoute allowedRoles={['operator', 'engineer', 'admin']}>
         <AnomalyIntelligencePage />
       </ProtectedRoute>
     } 
   /> 
   <Route 
  path="/incidents" 
  element={
    <ProtectedRoute allowedRoles={['operator', 'engineer', 'admin']}>
      <IncidentManagementPage />
    </ProtectedRoute>
  } 
/>
  <Route 
  path="/simulation" 
  element={
    <ProtectedRoute allowedRoles={['engineer', 'admin']}>
      <SimulationPage />
    </ProtectedRoute>
  } 
/>
        <Route 
     path="/reports" 
     element={
       <ProtectedRoute allowedRoles={['operator', 'engineer', 'admin']}>
         <ReportsPage />
       </ProtectedRoute>
     } 
   />
      <Route 
     path="/ai-assistant" 
     element={
       <ProtectedRoute allowedRoles={['operator', 'engineer', 'admin']}>
         <AIAssistantPage />
       </ProtectedRoute>
     } 
   />
        <Route 
  path="/settings" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <SettingsPage />
    </ProtectedRoute>
  } 
/>
        <Route 
          path="/engineer-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['engineer', 'admin']}>
              <EngineerDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;