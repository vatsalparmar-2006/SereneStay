import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRooms } from "../../api/rooms.api";
import { getAllStaff } from "../../api/staff.api";
import { getAllGuests } from "../../api/guest.api";
import { getAllBookings } from "../../api/booking.api";
import { getAllInvoices } from "../../api/invoice.api";
import { getAllServices } from "../../api/service.api";
import {
  LayoutDashboard, BedDouble, Users, CalendarCheck,
  Wallet, ChevronRight, LogOut, Bell, Search,
  ArrowUpRight, ArrowDownRight, UserPlus, DoorOpen,
  Receipt, Settings, RefreshCw, Activity, AlertCircle, X
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // FIX 1: Defined the missing state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [stats, setStats] = useState({
    rooms: { total: 0, occupied: 0, occupancyRate: 0 },
    finance: { totalRevenue: 0, pendingAmount: 0 },
    activity: { checkinsToday: 0, activeGuests: 0 },
    inventory: { staffCount: 0, serviceCount: 0 }
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);

  const adminName = localStorage.getItem("userName") || "Administrator";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [roomsRes, staffRes, guestsRes, bookingsRes, invoicesRes, servicesRes] = await Promise.all([
        getAllRooms(),
        getAllStaff(),
        getAllGuests(),
        getAllBookings(),
        getAllInvoices(),
        getAllServices()
      ]);

      const rooms = roomsRes.data || [];
      const bookings = bookingsRes.data || [];
      const invoices = invoicesRes.data || [];
      const today = new Date().toISOString().split('T')[0];

      const occupied = rooms.filter(r => r.status?.toLowerCase() === "occupied" || r.status?.toLowerCase() === "booked").length;
      const rate = rooms.length > 0 ? Math.round((occupied / rooms.length) * 100) : 0;
      const revenue = invoices.filter(inv => inv.paymentStatus === "Paid").reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const pending = invoices.filter(inv => inv.paymentStatus !== "Paid").reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const todayArrivals = bookings.filter(b => b.checkInDate?.split('T')[0] === today).length;

      setStats({
        rooms: { total: rooms.length, occupied, occupancyRate: rate },
        finance: { totalRevenue: revenue, pendingAmount: pending },
        activity: { checkinsToday: todayArrivals, activeGuests: guestsRes.data?.length || 0 },
        inventory: { staffCount: staffRes.data?.length || 0, serviceCount: servicesRes.data?.length || 0 }
      });

      setRecentBookings(bookings.slice(-5).reverse());
      setPendingInvoices(invoices.filter(inv => inv.paymentStatus !== "Paid").slice(0, 5));

    } catch (error) {
      toast.error("System sync failed. Data may be stale.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out safely");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      
      {/* Utility Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-200 shadow-lg">
            <LayoutDashboard className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">HMS <span className="text-indigo-600">Enterprise</span></span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={fetchDashboardData} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{adminName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Full Access</p>
            </div>
            {/* FIX 2: Correct trigger for modal */}
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
        
        {/* Real-time KPI Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.finance.totalRevenue.toLocaleString()}`} 
            subValue={`₹${stats.finance.pendingAmount.toLocaleString()} Pending`}
            icon={<Wallet className="text-blue-600" />} 
            color="blue"
          />
          <StatCard 
            title="Today's Check-ins" 
            value={stats.activity.checkinsToday} 
            subValue="Expected arrivals"
            icon={<CalendarCheck className="text-orange-600" />} 
            color="orange"
          />
          <StatCard 
            title="Occupancy Rate" 
            value={`${stats.rooms.occupancyRate}%` } 
            subValue={`${stats.rooms.occupied} / ${stats.rooms.total} Rooms`}
            icon={<BedDouble className="text-indigo-600" />} 
            color="indigo"
          />
          <StatCard 
            title="Staff Directory" 
            value={stats.inventory.staffCount} 
            subValue={`${stats.inventory.serviceCount} Active Services`}
            icon={<Users className="text-emerald-600" />} 
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feed: Recent Bookings */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <Activity className="text-indigo-600" size={20} />
                <h3 className="font-bold text-slate-800">Booking Activity Log</h3>
              </div>
              <button onClick={() => navigate("/staff/bookings")} className="text-xs font-bold text-indigo-600 hover:underline uppercase">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-500 font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Guest Info</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Schedule</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{b.guestName}</div>
                        <div className="text-[10px] text-slate-400 font-mono italic">#{b.bookingId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">Room {b.roomNumber}</td>
                      <td className="px-6 py-4 text-[11px] text-slate-500">
                        {new Date(b.checkInDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          b.bookingStatus === "Booked" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Unpaid Invoices */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Receipt className="text-rose-500" size={20} />
                <h3 className="font-bold text-slate-800">Unpaid Invoices</h3>
              </div>
              <div className="space-y-4">
                {pendingInvoices.map((inv, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{inv.guestName}</p>
                      <p className="text-[10px] text-slate-400">Invoice #{inv.invoiceId}</p>
                    </div>
                    <p className="text-sm font-black text-rose-600">₹{inv.totalAmount}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Management Dock */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-bold mb-6 text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings size={16} /> Quick Access
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate("/staff/rooms")} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-2 group">
                  <DoorOpen size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase">Rooms</span>
                </button>
                <button onClick={() => navigate("/staff/guests")} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-2 group">
                  <UserPlus size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase">Guests</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FIX 3: Added the Actual Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setShowLogoutModal(false)}
          ></div>
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Sign Out?</h2>
              <p className="text-slate-500 mt-2 font-medium">Are you sure you want to end your management session?</p>
            </div>
            <div className="flex gap-3 mt-10">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-200"
              >
                Back
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon, color }) => {
  const colorMap = {
    blue: "bg-blue-50 border-blue-100",
    indigo: "bg-indigo-50 border-indigo-100",
    orange: "bg-orange-50 border-orange-100",
    emerald: "bg-emerald-50 border-emerald-100"
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorMap[color]} shadow-sm transition-all hover:shadow-md hover:-translate-y-1`}>
      <div className="p-2 bg-white rounded-lg shadow-sm w-fit mb-4">{icon}</div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{subValue}</p>
    </div>
  );
};

export default Dashboard;