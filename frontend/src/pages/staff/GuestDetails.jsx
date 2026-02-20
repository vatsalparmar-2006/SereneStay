import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGuestById } from "../../api/guest.api";
import { getAllBookings } from "../../api/booking.api";
import { 
  ArrowLeft, Mail, Phone, MapPin, IdCard, 
  Clock, History, Calendar, CheckCircle2 
} from "lucide-react";

const GuestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [guest, setGuest] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Guest Profile
        const guestRes = await getGuestById(id);
        const guestData = Array.isArray(guestRes.data) ? guestRes.data[0] : guestRes.data;
        setGuest(guestData);

        // 2. Fetch All Bookings and filter for this guest
        const bookingRes = await getAllBookings();
        const guestHistory = bookingRes.data.filter(b => b.guestId === parseInt(id));
        setBookings(guestHistory);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!guest) return <div className="p-20 text-center font-serif text-2xl text-slate-400">Guest profile not found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      {/* Back Navigation */}
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-8 transition-all font-bold uppercase text-xs tracking-widest"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Directory
      </button>

      {/* Main Profile Header */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-800 relative">
            <div className="absolute -bottom-12 left-12 h-24 w-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl font-serif text-blue-600 border-4 border-white">
                {guest.fullName.charAt(0)}
            </div>
        </div>
        
        <div className="pt-16 px-12 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-serif text-slate-900">{guest.fullName}</h1>
              <p className="text-blue-600 font-bold flex items-center gap-2 mt-1">
                <CheckCircle2 size={16} /> Verified Guest #{guest.guestId}
              </p>
            </div>
            <div className="flex gap-8 text-sm">
                <div className="flex items-center gap-3 text-slate-500">
                    <Mail size={18} className="text-slate-300" /> {guest.email}
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                    <Phone size={18} className="text-slate-300" /> {guest.phone}
                </div>
            </div>
          </div>

          <hr className="my-10 border-slate-50" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">General Info</h3>
                <div className="flex items-start gap-4">
                    <MapPin className="text-blue-500 mt-1" size={20} />
                    <p className="text-slate-600 leading-relaxed">{guest.address || "No address provided"}</p>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Identification</h3>
                <div className="flex items-center gap-4">
                    <IdCard className="text-blue-500" size={20} />
                    <div>
                        <p className="text-slate-800 font-bold">{guest.idproofNumber}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase">{guest.idproofType}</p>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registration Info</h3>
                <div className="flex items-center gap-4">
                    <Clock className="text-blue-500" size={20} />
                    <div>
                        <p className="text-slate-800 font-bold">{new Date(guest.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase">Joined the hotel</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking History Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 ml-4">
            <History size={24} className="text-slate-400" />
            <h2 className="text-2xl font-serif text-slate-800">Booking History</h2>
        </div>

        {bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                    <div key={booking.bookingId} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">Room #{booking.roomId}</p>
                                <p className="text-xs text-slate-400">{booking.checkInDate} — {booking.checkOutDate}</p>
                            </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === 'Booked' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {booking.status}
                        </span>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-white py-16 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-serif italic text-lg">This guest hasn't made any reservations yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default GuestDetails;