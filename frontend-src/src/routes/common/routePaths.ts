export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/google/oauth/callback",
};

export const PROTECTED_ROUTES = {
  COMMUNITY: "/community/:communityId",
  TASKS: "/community/:communityId/tasks",
  MEMBERS: "/community/:communityId/members",
  SETTINGS: "/community/:communityId/settings",
  PROJECT_DETAILS: "/community/:communityId/project/:projectId",
};

