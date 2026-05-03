import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Settings, LogOut, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/login");
  };

  const initials = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-[#1A1A1A] border-r border-[#2A2A2A] flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#2A2A2A]">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        <div>
          <span className="text-white font-bold text-sm tracking-tight">QuizForge</span>
          <p className="text-[#52525B] text-[10px] leading-none mt-0.5">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/25"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#252525]"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-[#2A2A2A]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="w-7 h-7 bg-indigo-600/30 border border-indigo-500/40 rounded-full flex items-center justify-center shrink-0">
            <span className="text-indigo-300 text-xs font-bold">{initials}</span>
          </div>
          <p className="text-[#A1A1AA] text-xs truncate flex-1">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}