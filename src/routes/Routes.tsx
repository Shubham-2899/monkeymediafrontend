import { Routes, Route, Navigate } from "react-router-dom";
import CreateLink from "../pages/createLink";
import EmailForm from "../pages/mailing";
import Report from "../pages/report";
import Signin from "../login/SignIn";
import { ForgotPassword } from "../login/ForgotPassword";
import Home from "../pages/home";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Users from "../pages/admin/pages/users/Users";
// import AddEmails from "../pages/admin/pages/add-emails";
import BullMQDashboard from "../pages/bullmq-dashboard";
import Admin from "../pages/admin";
// import CampaignsPage from "../pages/campaigns";
import EmailAnalytics from "../components/EmailAnalytics";

const MonkeyMediaRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={<Signin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes for Authenticated Users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/create-link" element={<CreateLink />} />
        <Route path="/mailing" element={<EmailForm />} />
        <Route path="/analytics" element={<EmailAnalytics />} />
      </Route>

      {/* Admin Routes - Only accessible by admins */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/users" element={<Users />} />
        {/* <Route path="/admin/email-list" element={<AddEmails />} /> */}
        <Route path="/admin/dashboard" element={<BullMQDashboard />} />
        {/* <Route path="/admin/campaigns" element={<CampaignsPage />} /> */}
        <Route path="/admin/analytics" element={<EmailAnalytics />} />
        {/* Add other admin routes here */}
      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

export default MonkeyMediaRoutes;
