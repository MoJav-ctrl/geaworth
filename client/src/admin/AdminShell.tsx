import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.tsx";
import { btnSecondary } from "./ui.tsx";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-xl text-[14px] font-bold transition-colors ${isActive ? "bg-brand-navy text-white" : "text-brand-nav hover:bg-brand-tint2"}`;

/** Signed-in frame: redirects to the login page when there is no session. */
export function AdminShell() {
  const { user, ready, logout } = useAuth();
  const location = useLocation();

  if (!ready) return <div className="min-h-screen bg-brand-canvas" aria-busy="true" />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  const isAdmin = user.role === "admin";
  return (
    <div className="min-h-screen bg-brand-canvas">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:bg-white focus:px-3 focus:py-2 focus:rounded-xl">
        Skip to content
      </a>
      <header className="bg-white border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/admin" className="font-serif text-xl font-bold text-brand-ink">
            Geaworth<span className="text-brand-red">.</span> <span className="text-[13px] font-sans font-bold text-brand-muted">Admin</span>
          </Link>
          <nav aria-label="Admin" className="flex flex-wrap items-center gap-1 flex-1">
            <NavLink to="/admin" end className={linkCls}>Listings</NavLink>
            <NavLink to="/admin/listings/new" className={linkCls}>Add listing</NavLink>
            {isAdmin && <NavLink to="/admin/users" className={linkCls}>Users</NavLink>}
            {isAdmin && <NavLink to="/admin/inquiries" className={linkCls}>Inquiries</NavLink>}
            <NavLink to="/admin/account" className={linkCls}>Account</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-brand-muted hidden sm:inline">
              {user.name} · {isAdmin ? "Admin" : "Uploader"}
            </span>
            <a href="/" className="text-[13px] font-bold text-brand-navy hover:underline">View site</a>
            <button type="button" onClick={() => void logout()} className={btnSecondary}>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main id="admin-main" className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
