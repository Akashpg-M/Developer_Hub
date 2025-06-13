import GoogleOAuthFailure from "../../page/auth/GoogleOAuthFailure";
import SignIn from "../../page/auth/Sign-in";
import SignUp from "../../page/auth/Sign-up";
import WorkspaceDashboard from "../../page/community/Dashboard";
import Members from "../../page/community/Members";
import ProjectDetails from "../../page/community/ProjectDetails";
import Settings from "../../page/community/Settings";
import Tasks from "../../page/community/Tasks";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./routePaths";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuthFailure /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.COMMUNITY, element: <WorkspaceDashboard /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
];
