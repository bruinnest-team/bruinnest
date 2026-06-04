import { Navigate, Route, Routes } from "react-router-dom";
import BrowsePage from "../pages/BrowsePage";
import HousingPage from "../pages/HousingPage";
import FavoritesPage from "../pages/FavoritesPage";
import LoginPage from "../pages/LoginPage";
import MapPage from "../pages/MapPage";
import MessagesPage from "../pages/MessagesPage";
import ProfileDetailPage from "../pages/ProfileDetailPage";
import ProfileSetupPage from "../pages/ProfileSetupPage";
import QuestionnairePage from "../pages/QuestionnairePage";
import RegisterPage from "../pages/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
      <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
      <Route path="/questionnaire" element={<ProtectedRoute><QuestionnairePage /></ProtectedRoute>} />
      <Route path="/housing" element={<ProtectedRoute><HousingPage /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/profiles/:userId" element={<ProtectedRoute><ProfileDetailPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
