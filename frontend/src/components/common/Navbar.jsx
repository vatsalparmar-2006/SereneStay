import { NavLink } from "react-router-dom";
import { Hotel, UserCircle } from "lucide-react";

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-all duration-300 relative py-1 ${
      isActive 
        ? "text-blue-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full" 
        : "text-slate-500 hover:text-blue-500"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Hotel size={18} strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
          Serene<span className="text-blue-600">Stay</span>
        </h1>
      </div>

      <div className="flex items-center gap-8">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>

        <NavLink to="/login" className="group flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm shadow-blue-100">
          <UserCircle size={18} className="group-hover:rotate-12 transition-transform" />
          Staff Login
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;