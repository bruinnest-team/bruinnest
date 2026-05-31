import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logout as logoutApi } from "../../lib/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.success) {
          setCurrentUser(res.data.user);
          setIsAuthenticated(true);
          setProfileCompleted(res.data.profileCompleted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function refreshUser(user, profileCompleted) {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setProfileCompleted(profileCompleted);
  }

  async function logout() {
    await logoutApi();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setProfileCompleted(false);
  }

  const value = {
    currentUser,
    isAuthenticated,
    profileCompleted,
    loading,
    refreshUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
