import { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DashboardPage } from "@/pages/dashboard";
import { DocumentPage } from "@/pages/document";
import { LoginPage } from "@/pages/login";
import { NotFoundPage } from "@/pages/not-found";
import { ProfilePage } from "@/pages/profile";
import { RegisterPage } from "@/pages/register";
import { useAppDispatch, useAppSelector } from "@/store";
import { refreshToken } from "@/store/authSlice";

// ProtectedRoute component with route preservation
function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/documents/:documentId",
            element: <DocumentPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function Router() {
  const dispatch = useAppDispatch();
  const isInitialLoading = useAppSelector(
    (state) => state.auth.isInitialLoading
  );

  // Trigger token refresh on app init
  useEffect(() => {
    dispatch(refreshToken());
  }, [dispatch]);

  if (isInitialLoading) {
    return (
      <div className="boot-loader-screen">
        <LoadingSpinner size={32} className="boot-loader-spinner" />
        <span className="boot-loader-text">Загрузка сессии...</span>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
