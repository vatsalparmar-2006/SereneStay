import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Hotel, UserCircle, LogOut, ArrowLeftRight, LayoutDashboard, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "Staff Member";
  const isStaffRoute = location.pathname.startsWith("/staff");

  const handleLogout = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-all duration-300 relative py-1 ${
      isActive 
        ? "text-blue-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full" 
        : "text-slate-500 hover:text-slate-900"
    }`;

  return (
    <>
      <nav className="bg-white border-b border-slate-100 px-8 h-16 flex justify-between items-center shadow-sm sticky top-0 z-50 select-none">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-100">
              <Hotel size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Seren<span className="text-blue-600">Stay</span>
            </h1>
          </NavLink>
        </div>

        {/* Absolute Centered Welcome Badge */}
        {token && (
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 shadow-sm shadow-blue-50/50">
              {isStaffRoute ? `Welcome back, ${userName === "Staff Member" ? "Admin Vatsal" : userName}` : "Welcome to SerenStay"}
            </span>
          </div>
        )}

        {/* Navigation Options */}
        <div className="flex items-center gap-6">
          {/* If on Guest/Public pages */}
          {!isStaffRoute ? (
            <>
              <NavLink to="/" className={linkClass}>
                Home
              </NavLink>
              
              {token ? (
                <button 
                  onClick={() => setShowLogoutModal(true)} 
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 ml-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              ) : (
                <NavLink to="/login" className="group flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm shadow-blue-100">
                  <UserCircle size={18} className="group-hover:rotate-12 transition-transform" />
                  Staff Login
                </NavLink>
              )}
            </>
          ) : (
            /* If on Staff Pages */
            <>
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800">{userName}</p>
                  <p className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">{userRole}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {userName.charAt(0)}
                </div>
                <button 
                  onClick={() => setShowLogoutModal(true)} 
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setShowLogoutModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl overflow-hidden z-10"
            >
              <div className="text-center">
                <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Confirm Logout</h2>
                <p className="text-slate-500 mt-2 text-sm font-medium leading-relaxed">
                  Your session will be securely ended. Are you sure you want to log out?
                </p>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex-1 py-3 bg-rose-600 text-white font-semibold rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;