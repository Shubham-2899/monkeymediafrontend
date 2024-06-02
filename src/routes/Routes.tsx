import { Route, Routes } from "react-router-dom";
import CreateLink from "../pages/createLink";
import EmailForm from "../pages/mailing";

const MonkeyMediaRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/report" element={<div>report</div>} />
      <Route path="/create-link" element={<CreateLink />} />
      <Route path="/mailing" element={<EmailForm />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
};

export default MonkeyMediaRoutes;
