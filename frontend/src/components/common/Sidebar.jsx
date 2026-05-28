import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Hotel, BedDouble, Users, 
  CalendarCheck, Receipt, UserCircle, Briefcase
} from "lucide-react";

const Sidebar = () => {
  const userRole = localStorage.getItem("userRole");

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-semibold ${
      isActive
        ? "bg-blue-600 text-white shadow-md shadow-blue-100/50"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
    }`;

  const menuItems = [
    { name: "Dashboard", path: "/staff/dashboard", icon: <LayoutDashboard size={18} />, roles: ["Admin", "Manager", "Receptionist"] },
    { name: "Bookings", path: "/staff/bookings", icon: <CalendarCheck size={18} />, roles: ["Admin", "Manager", "Receptionist"] },
    { name: "Rooms", path: "/staff/rooms", icon: <Hotel size={18} />, roles: ["Admin", "Manager", "Receptionist"] },
    { name: "Room Types", path: "/staff/room-types", icon: <BedDouble size={18} />, roles: ["Admin", "Manager", "Receptionist"] },
    { name: "Guests", path: "/staff/guests", icon: <UserCircle size={18} />, roles: ["Admin", "Manager", "Receptionist"] },
    { name: "Services", path: "/staff/services", icon: <Briefcase size={18} />, roles: ["Admin", "Manager", "Receptionist"] },
    { name: "Invoices", path: "/staff/invoices", icon: <Receipt size={18} />, roles: ["Admin", "Manager", "Receptionist"] },
    { name: "Staff", path: "/staff/staff", icon: <Users size={18} />, roles: ["Admin", "Manager", "Receptionist"] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-60 bg-white border-r border-slate-100 flex flex-col p-4 shrink-0 select-none h-[calc(100vh-4rem)] overflow-y-auto sticky top-16 left-0 z-40">
      <nav className="flex flex-col gap-1">
        {visibleItems.map((item) => (
          <NavLink key={item.name} to={item.path} className={linkClass}>
            <span className="transition-transform duration-200 group-hover:scale-105">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;