import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../lib/api";

type User = { id: string; email: string; name: string } | null;

interface AuthContextShape {
  user: User;
  token: string | null;
  loading: boolean;
  error: string | null;
  requestOtp: (
    email: string,
    mode?: "signup" | "signin"
  ) => Promise<{
    emailExists?: boolean;
    user?: { email: string; name: string };
    code?: string;
    emailServiceWorking?: boolean;
  }>;
  verifyOtp: (p: {
    email: string;
    name: string;
    dateOfBirth?: string;
    code: string;
  }) => Promise<void>;
  signinOtp: (p: { email: string; code: string }) => Promise<void>;
  setTokenFromExternal: (token: string) => Promise<void>;
  logout: () => void;
  googleLoginUrl: string;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!token) return setLoading(false);
      try {
        const res = await api.me(token);
        if (!cancelled) setUser(res.user);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.error || "Failed to load session");
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const requestOtp = async (
    email: string,
    mode: "signup" | "signin" = "signup"
  ) => {
    setError(null);
    const result = await api.requestOtp(email, mode);
    return result;
  };

  const verifyOtp = async (p: {
    email: string;
    name: string;
    dateOfBirth?: string;
    code: string;
  }) => {
    setError(null);
    const res = await api.verifyOtp(p);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signinOtp = async (p: { email: string; code: string }) => {
    setError(null);
    const res = await api.signinOtp(p);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const setTokenFromExternal = async (tok: string) => {
    localStorage.setItem("token", tok);
    setToken(tok);
    setLoading(true);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      requestOtp,
      verifyOtp,
      signinOtp,
      setTokenFromExternal,
      logout,
      googleLoginUrl: api.googleLoginUrl(),
    }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
