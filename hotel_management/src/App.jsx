import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./loginPage.jsx";
import SignupPage from "./signupPage.jsx";
import ForgotPassword from "./forgotPassword.jsx";
import ResetPassword from "./reset-password.jsx";
import BasicInfo from "./basicInfo.jsx";
import Dashboard from "./dashboard.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import HotelDetails from "./hotelDetails.jsx";
import Book from "./book.jsx";
import Bookings from "./bookings.jsx";
import Profile from "./profile.jsx";
import Notification from "./notification.jsx";

// Lazy load admin components
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminSignup = lazy(() => import("./pages/admin/Signup"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminHotels = lazy(() => import("./pages/admin/Hotels"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));

// Admin Protected Route
const AdminRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

// Utility function to handle API responses consistently
export const handleApiResponse = async (response) => {
  const contentType = response.headers.get('content-type');

  if (response.status === 204 || response.status === 205) {
    // Handle No Content responses
    return { message: 'Success but no data returned' };
  }

  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    // Handle non-JSON responses (plain text, HTML, etc.)
    const textResponse = await response.text();
    throw new Error(`Server returned non-JSON response (${response.status}): ${textResponse || 'Unknown error'}`);
  }
};

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/basic-info" element={<BasicInfo />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          
          {/* Protected Admin Routes with Layout */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="hotels" element={<AdminHotels />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
          
          {/* Redirect any other admin routes to login */}
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />

          {/* Protected routes - authentication required */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/hotel/:id" element={
            <ProtectedRoute>
              <HotelDetails />
            </ProtectedRoute>
          } />
          <Route path="/book" element={
            <ProtectedRoute>
              <Book />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notification />
            </ProtectedRoute>
          } />

          {/* Catch-all route for invalid paths - redirect to login */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
