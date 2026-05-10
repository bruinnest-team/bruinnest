import { Navigate, Route, Routes } from "react-router-dom";
import BrowsePage from "../pages/BrowsePage";
import LoginPage from "../pages/LoginPage";
import MessagesPage from "../pages/MessagesPage";
import ProfileDetailPage from "../pages/ProfileDetailPage";
import ProfileSetupPage from "../pages/ProfileSetupPage";
import RegisterPage from "../pages/RegisterPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfileSetupPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/profiles/:userId" element={<ProfileDetailPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
