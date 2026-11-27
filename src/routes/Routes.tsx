import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
import MailLoader from "../components/MailLoader";

// Public marketing site (raspixmedia.com pages) — split out of the portal bundle.
const SiteHome = lazy(() => import("../site/pages/SiteHome"));
const AboutPage = lazy(() => import("../site/pages/AboutPage"));
const ServicesPage = lazy(() => import("../site/pages/ServicesPage"));
const ContactPage = lazy(() => import("../site/pages/ContactPage"));
const PortfolioPage = lazy(() => import("../site/pages/PortfolioPage"));
const PrivacyPage = lazy(() => import("../site/pages/PrivacyPage"));
const NotFound = lazy(() => import("../site/pages/NotFound"));

/** Start each new page at the top (hash links are handled by the page). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

const MonkeyMediaRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<MailLoader variant="fullscreen" size={140} label="Loading" />}>
        <Routes>
          {/* Public website */}
          <Route path="/" element={<SiteHome />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />

          {/* Public auth routes */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes for Authenticated Users (portal) */}
          <Route element={<ProtectedRoute />}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default MonkeyMediaRoutes;
