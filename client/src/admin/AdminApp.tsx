import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext.tsx";
import { AdminShell } from "./AdminShell.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { ListingsPage } from "./ListingsPage.tsx";
import { ListingFormPage } from "./ListingFormPage.tsx";
import { UsersPage } from "./UsersPage.tsx";
import { InquiriesPage } from "./InquiriesPage.tsx";
import { AccountPage } from "./AccountPage.tsx";

/** Keeps the admin area out of search results. */
function NoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  return null;
}

/** Pages only administrators may open; uploaders are sent back to the listings page. */
function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user?.role === "admin" ? <>{children}</> : <Navigate to="/admin" replace />;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <NoIndex />
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<AdminShell />}>
          <Route index element={<ListingsPage />} />
          <Route path="listings/new" element={<ListingFormPage />} />
          <Route path="listings/:id" element={<ListingFormPage />} />
          <Route path="users" element={<AdminOnly><UsersPage /></AdminOnly>} />
          <Route path="inquiries" element={<AdminOnly><InquiriesPage /></AdminOnly>} />
          <Route path="account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
