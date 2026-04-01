export interface Session {
  email: string;
  participantId: number;
}

export function getSession(): Session | null {
  try {
    const data = localStorage.getItem("workshop-session");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  localStorage.setItem("workshop-session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("workshop-session");
}

export function getAdminAuth(): boolean {
  return localStorage.getItem("admin-authenticated") === "true";
}

export function setAdminAuth(authenticated: boolean) {
  if (authenticated) {
    localStorage.setItem("admin-authenticated", "true");
  } else {
    localStorage.removeItem("admin-authenticated");
  }
}
