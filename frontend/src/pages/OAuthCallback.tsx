import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setTokenFromExternal } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1); // token=...
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    if (token) {
      setTokenFromExternal(token)
        .then(() => navigate("/dashboard", { replace: true }))
        .catch(() => setError("Failed to initialize session"));
    } else {
      setError("Missing token");
    }
  }, [navigate, setTokenFromExternal]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? <p className="text-red-600">{error}</p> : <p>Signing you in…</p>}
    </div>
  );
};

export default OAuthCallback;
