export interface ApiError {
  error: string;
  details?: any;
}

const BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const err: ApiError =
      typeof body === "object" ? body : { error: String(body) };
    throw err;
  }
  return body as T;
}

export const api = {
  requestOtp(email: string, mode: "signup" | "signin" = "signup") {
    return request<{
      ok: boolean;
      message: string;
      code?: string;
      emailExists?: boolean;
      user?: { email: string; name: string };
      emailServiceWorking?: boolean;
    }>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email, mode }),
    });
  },
  verifyOtp(params: {
    email: string;
    name: string;
    dateOfBirth?: string;
    code: string;
  }) {
    return request<{
      token: string;
      user: { id: string; email: string; name: string };
    }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        name: params.name,
        dateOfBirth: params.dateOfBirth,
        code: params.code,
      }),
    });
  },
  signinOtp(params: { email: string; code: string }) {
    return request<{
      token: string;
      user: { id: string; email: string; name: string };
    }>("/api/auth/signin-otp", {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        code: params.code,
      }),
    });
  },
  me(token: string) {
    return request<{ user: { id: string; email: string; name: string } }>(
      "/api/auth/me",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
  listNotes(token: string) {
    return request<{ notes: { id: string; title: string }[] }>("/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  createNote(token: string, title: string) {
    return request<{ note: { id: string; title: string } }>("/api/notes", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title }),
    });
  },
  deleteNote(token: string, id: string) {
    return request<void>(`/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  googleLoginUrl() {
    return `${BASE_URL}/api/auth/google`;
  },
};
