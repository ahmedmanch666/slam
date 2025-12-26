import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Companies from './pages/Companies';
import Tenders from './pages/Tenders';
import TenderDetails from './pages/TenderDetails';
import Contracts from './pages/Contracts';
import Tasks from './pages/Tasks';
import './index.css';

function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  if (!auth?.accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { auth } = useAuth();
  if (auth?.accessToken) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/companies" element={
        <ProtectedRoute>
          <Companies />
        </ProtectedRoute>
      } />
      <Route path="/companies/new" element={
        <ProtectedRoute>
          <Companies />
        </ProtectedRoute>
      } />
      <Route path="/tenders" element={
        <ProtectedRoute>
          <Tenders />
        </ProtectedRoute>
      } />
      <Route path="/tenders/:id" element={
        <ProtectedRoute>
          <TenderDetails />
        </ProtectedRoute>
      } />
      <Route path="/contracts" element={
        <ProtectedRoute>
          <Contracts />
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <Tasks />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
