import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EditUsers from './pages/EditUsers';
import UserDashboard from './pages/UserDashboard';
import ChangePassword from './pages/ChangePassword';
import PasswordReset from './pages/PasswordReset';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import PrivateRoute from './routes/PrivateRoutes';
import AdminRoute from './routes/AdminRoute';
import UserRoute from './routes/UserRoute';
import PublicRoute from './routes/PublicRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login page */}
          <Route path="/" element={<Login />} />
          

          {/* Public routes */}
          <Route
            path="/password-reset"
            element={
              <PublicRoute>
                <PasswordReset />
              </PublicRoute>
            }
          />
          <Route
            path="/password-reset-confirm"
            element={
              <PublicRoute>
                <PasswordResetConfirm />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/edit-users"
            element={
              <AdminRoute>
                <EditUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/user"
            element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;