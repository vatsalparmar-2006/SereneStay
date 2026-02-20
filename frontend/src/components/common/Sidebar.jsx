import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Hotel, BedDouble, Users, 
  CalendarCheck, Receipt, UserCircle, Briefcase 
} from "lucide-react";

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      isActive
        ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
    }`;

  const menuItems = [
    { name: "Dashboard", path: "/staff/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Bookings", path: "/staff/bookings", icon: <CalendarCheck size={20} /> },
    { name: "Rooms", path: "/staff/rooms", icon: <Hotel size={20} /> },
    { name: "Room Types", path: "/staff/room-types", icon: <BedDouble size={20} /> },
    { name: "Guests", path: "/staff/guests", icon: <UserCircle size={20} /> },
    { name: "Services", path: "/staff/services", icon: <Briefcase size={20} /> },
    { name: "Invoices", path: "/staff/invoices", icon: <Receipt size={20} /> },
    { name: "Staff Management", path: "/staff/staff", icon: <Users size={20} /> },
  ];

  return (
    <aside className="w-72 min-h-screen bg-white border-r border-gray-100 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Hotel size={22} strokeWidth={2.5} />
        </div>
        <span className="text-xl font-black text-gray-800 tracking-tighter uppercase">
          Serene<span className="text-blue-600">Stay</span>
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink key={item.name} to={item.path} className={linkClass}>
            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="text-[15px]">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Optional: Simple Versioning at bottom */}
      <div className="mt-auto pt-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">
        SereneStay Admin v2.0
      </div>
    </aside>
  );
};

export default Sidebar;