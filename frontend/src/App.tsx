import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SignupPage from "./pages/SignupPage";
import OAuthCallback from "./pages/OAuthCallback";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/"
        element={<Navigate to={token ? "/dashboard" : "/signup"} replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
