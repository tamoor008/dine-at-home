export interface SessionLike {
  user?: {
    role?: string | null;
    [key: string]: any;
  } | null;
}

export function getRedirectUrl(session: SessionLike | null): string {
  if (!session?.user) {
    return "/";
  }

  // Redirect hosts to their dashboard
  if (session.user.role === "host") {
    return "/host/dashboard";
  }

  // Redirect guests to home page
  return "/";
}

export function shouldRedirectToDashboard(
  session: SessionLike | null
): boolean {
  return session?.user?.role === "host";
}
