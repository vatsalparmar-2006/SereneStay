import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout";
import StaffLayout from "../layouts/StaffLayout";
import Home from "../pages/guest/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register"; // Import the Register page
import Dashboard from "../pages/staff/Dashboard";
import Rooms from "../pages/staff/Rooms";
import RoomTypes from "../pages/staff/RoomTypes";
import Staff from "../pages/staff/Staff";
import Guests from "../pages/staff/Guests";
import Bookings from "../pages/staff/Bookings";
import Services from "../pages/staff/Services";
import Invoices from "../pages/staff/Invoices";

// Simple Protected Route Component
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  // If no token exists, redirect to login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Side */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth - Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Staff Section - Protected by JWT */}
        <Route path="/staff" element={<ProtectedRoute />}>
          <Route element={<StaffLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="room-types" element={<RoomTypes />} />
            <Route path="guests" element={<Guests />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="services" element={<Services />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="staff" element={<Staff />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;