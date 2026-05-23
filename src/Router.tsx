import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { Button } from "@/components/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/dashboard";
import { DocumentPage } from "@/pages/document";
import { NotFoundPage } from "@/pages/not-found";
import { ProfilePage } from "@/pages/profile";
import { useAppDispatch, useAppSelector } from "@/store";
import { authActions } from "@/store/authSlice";

// ProtectedRoute component
function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Premium Mock LoginPage
function MockLoginPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = () => {
    dispatch(
      authActions.setUser({
        id: "mock-user-123",
        name: "Михаил",
        email: "michael@example.com",
      })
    );
  };

  return (
    <div className="not-found-container" style={{ minHeight: "100vh" }}>
      <div className="not-found-card" style={{ maxWidth: "400px" }}>
        <h1
          className="not-found-title"
          style={{ fontSize: "3rem", marginBottom: "var(--spacing-4)" }}
        >
          Вход
        </h1>
        <h2
          className="not-found-subtitle"
          style={{
            fontSize: "var(--font-size-lg)",
            marginBottom: "var(--spacing-3)",
          }}
        >
          Табличный Процессор
        </h2>
        <p
          className="not-found-description"
          style={{ marginBottom: "var(--spacing-6)" }}
        >
          Пожалуйста, выполните вход в систему с использованием демонстрационной
          учетной записи.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={handleLogin}
          style={{ width: "100%" }}
        >
          Войти как Михаил
        </Button>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <MockLoginPage />,
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
  return <RouterProvider router={router} />;
}
