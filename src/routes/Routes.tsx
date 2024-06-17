// routes/Routes.js
import { Routes, Route } from "react-router-dom";
import CreateLink from "../pages/createLink";
import EmailForm from "../pages/mailing";
import Report from "../pages/report";
import ProtectedRoute from "../components/ProtectedRoute";
import Signin from "../login/SignIn";
import { ForgotPassword } from "../login/ForgotPassword";
import Home from "../pages/home";

const MonkeyMediaRoutes = () => {
  return (
    <Routes>
      <Route path="/signin" element={<Signin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/create-link" element={<CreateLink />} />
        <Route path="/mailing" element={<EmailForm />} />
      </Route>
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
};

export default MonkeyMediaRoutes;
