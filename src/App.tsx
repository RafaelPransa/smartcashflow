import { lazy, Suspense } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Tags,
} from "lucide-react";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const ChartsPage = lazy(() => import("@/pages/ChartsPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));

function PageLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        Memuat...
      </div>
    </div>
  );
}

const desktopNavItemClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-orange-100"
  }`;

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transaksi", icon: ReceiptText, end: false },
  { to: "/charts", label: "Grafik", icon: BarChart3, end: false },
  { to: "/categories", label: "Kategori", icon: Tags, end: false },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-blue-600 leading-tight">
                Smart<span className="text-orange-500">CashFlow</span>
              </h1>
              <p className="text-[10px] text-slate-600 font-medium sm:hidden">
                Pencatatan Keuangan
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={desktopNavItemClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area (extra pb-24 on mobile to prevent content being covered by bottom bar) */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:pb-8">
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only on screens < md) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200/80 bg-white/95 backdrop-blur-lg px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition duration-150 ${isActive
                  ? "text-orange-500 font-semibold"
                  : "text-slate-400 hover:text-slate-600 active:scale-95"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isActive ? "bg-orange-50 text-orange-500 scale-105" : ""
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                  </div>
                  <span className={`text-[11px] leading-tight mt-0.5 ${isActive ? "font-semibold text-orange-500" : ""}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
