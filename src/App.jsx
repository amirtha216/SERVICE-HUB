import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// User Pages
import UserHome from './pages/user/Home';
import UserServices from './pages/user/Services';
import UserServiceDetails from './pages/user/ServiceDetails';
import UserBookings from './pages/user/Bookings';
import UserTrackBooking from './pages/user/TrackBooking';
import UserProfile from './pages/user/Profile';
import UserNotifications from './pages/user/Notifications';
import UserWallet from './pages/user/Wallet';
import UserSettings from './pages/user/Settings';
import UserFAQ from './pages/user/FAQ';
import UserContact from './pages/user/Contact';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderRequests from './pages/provider/Requests';
import ProviderEarnings from './pages/provider/Earnings';
import ProviderProfile from './pages/provider/Profile';
import ProviderBookings from './pages/provider/Bookings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProviders from './pages/admin/Providers';
import AdminBookings from './pages/admin/Bookings';
import AdminServices from './pages/admin/Services';
import AdminReports from './pages/admin/Reports';
import AdminComplaints from './pages/admin/Complaints';
import AdminNotifications from './pages/admin/Notifications';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="home" element={<UserHome />} />
          <Route path="services" element={<UserServices />} />
          <Route path="services/:slug" element={<UserServiceDetails />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="bookings/:id" element={<UserBookings />} />
          <Route path="track/:id" element={<UserTrackBooking />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="wallet" element={<UserWallet />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="faq" element={<UserFAQ />} />
          <Route path="contact" element={<UserContact />} />
          <Route path="*" element={<Navigate to="/user/home" replace />} />
        </Route>

        {/* Provider Routes */}
        <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<ProviderDashboard />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="bookings/:id" element={<ProviderDashboard />} />
          <Route path="requests" element={<ProviderRequests />} />
          <Route path="earnings" element={<ProviderEarnings />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="faq" element={<UserFAQ />} />
          <Route path="contact" element={<UserContact />} />
          <Route path="*" element={<Navigate to="/provider/dashboard" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="faq" element={<UserFAQ />} />
          <Route path="contact" element={<UserContact />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
