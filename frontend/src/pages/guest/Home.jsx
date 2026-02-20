import { useState } from "react";
import { searchAvailableRooms } from "../../api/rooms.api";
import { addBooking, getBookingsByEmail } from "../../api/booking.api";
import { addGuest, getGuestByEmail } from "../../api/guest.api";
import { 
  Search, Users, Calendar, Sparkles, X, 
  CheckCircle, CreditCard, MapPin, ShieldCheck, 
  Star, AlertCircle, Wifi, Wind, Coffee, Tv, ArrowLeft, Mail, UserCircle
} from "lucide-react";
import toast from "react-hot-toast";

const Home = () => {
  // Search States
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Data States
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null); 
  const [showForm, setShowForm] = useState(false); 
  const [searchWarning, setSearchWarning] = useState("");
  
  // My Bookings States
  const [searchEmail, setSearchEmail] = useState("");
  const [myBookings, setMyBookings] = useState(null);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [apiError, setApiError] = useState(""); 

  // Guest Registration State
  const [guestForm, setGuestForm] = useState({
    fullName: "", email: "", phone: "", address: "", idproofType: "Aadhar", idproofNumber: ""
  });

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select travel dates.");
      return;
    }
    setLoading(true);
    setSearchWarning("");
    setSelectedRoom(null);
    setShowForm(false);
    try {
      const response = await searchAvailableRooms({ checkIn, checkOut, adults, children });
      const data = response.data;
      const roomData = data.rooms || (Array.isArray(data) ? data : []);
      setRooms(roomData);
      if (data.requiresMultipleRooms && data.message) setSearchWarning(data.message);
      else if (roomData.length === 0) toast.error("No suites available for these dates.");
    } catch (err) {
      toast.error("Search failed.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchHistory = async () => {
    if (!searchEmail) { toast.error("Enter your email."); return; }
    setFetchingHistory(true);
    try {
      const res = await getBookingsByEmail(searchEmail);
      setMyBookings(res.data);
      if (res.data.length === 0) toast.error("No history found.");
    } catch (err) { toast.error("Failed to retrieve stays."); }
    finally { setFetchingHistory(false); }
  };

  const handleFinalBooking = async () => {
    setBookingLoading(true);
    setApiError("");
    try {
      let guestId;
      try {
        const existingRes = await getGuestByEmail(guestForm.email);
        guestId = existingRes.data.guestId || existingRes.data.GuestId;
      } catch (e) {
        const newGuestRes = await addGuest({
          FullName: guestForm.fullName, Email: guestForm.email,
          Phone: guestForm.phone, Address: guestForm.address,
          IdproofType: guestForm.idproofType, IdproofNumber: guestForm.idproofNumber
        });
        guestId = newGuestRes.data.guestId || newGuestRes.data.GuestId;
      }

      await addBooking({
        GuestId: guestId, RoomId: selectedRoom.roomID, 
        CheckInDate: checkIn, CheckOutDate: checkOut, Status: "Booked"
      });
      
      setBookingSuccess(true);
      toast.success("Stay Reserved!");
      setTimeout(() => {
        setBookingSuccess(false); setSelectedRoom(null); setShowForm(false); setRooms([]);
        setGuestForm({ fullName: "", email: "", phone: "", address: "", idproofType: "Aadhar", idproofNumber: "" });
      }, 3500);
    } catch (err) {
      let errorText = "Booking failed.";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') errorText = data;
        else if (data.errors) errorText = Array.isArray(data.errors) ? data.errors[0] : Object.values(data.errors)[0][0];
        else if (data.message) errorText = data.message;
      }
      setApiError(errorText);
      toast.error(errorText);
    } finally { setBookingLoading(false); }
  };

  const DEFAULT_IMG = "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 pb-20">
      {/* Hero Section */}
      <div className={`relative transition-all duration-700 ${selectedRoom ? 'h-[45vh]' : 'h-[65vh]'} flex items-center justify-center overflow-hidden`}>
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          {/* Quick Access Profile Link */}
          <button 
            onClick={() => document.getElementById('my-profile-section').scrollIntoView({ behavior: 'smooth' })}
            className="mb-6 mx-auto flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            <UserCircle size={16} /> My Bookings
          </button>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">Serene Stay</h1>
          {!selectedRoom && <p className="text-lg font-medium opacity-80 uppercase tracking-widest">Experience True Tranquility</p>}
        </div>
      </div>

      {/* Search Bar */}
      {!selectedRoom && (
        <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Check In</label>
              <input type="date" value={checkIn} min={new Date().toISOString().split("T")[0]} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-gray-50 p-4 rounded-xl border-none font-bold mt-1 outline-none" />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Check Out</label>
              <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-gray-50 p-4 rounded-xl border-none font-bold mt-1 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Adults</label>
              <input type="number" min="1" value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full bg-gray-50 p-4 rounded-xl border-none font-bold mt-1 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Children</label>
              <input type="number" min="0" value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-full bg-gray-50 p-4 rounded-xl border-none font-bold mt-1 outline-none" />
            </div>
            <div className="md:col-span-2">
              <button onClick={handleSearch} disabled={loading} className="w-full bg-blue-600 text-white h-[60px] rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase text-xs tracking-widest">
                {loading ? "..." : "Search"}
              </button>
            </div>
          </div>
          {searchWarning && <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800"><AlertCircle size={20}/><p className="font-bold text-sm">{searchWarning}</p></div>}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-8 py-16">
        {selectedRoom ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => setSelectedRoom(null)} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-8 font-black text-xs uppercase tracking-widest transition-colors">
              <ArrowLeft size={18} /> Back to Search
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[3rem] p-6 border border-gray-100 shadow-sm">
              <div className="h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl"><img src={DEFAULT_IMG} className="w-full h-full object-cover" alt="Suite" /></div>
              <div className="py-8 pr-4">
                <div className="flex justify-between items-start mb-6">
                  <div><h2 className="text-5xl font-black text-gray-900 tracking-tighter">{selectedRoom.roomTypeName}</h2><p className="text-blue-600 font-bold mt-2 uppercase text-xs tracking-widest">Premium suite #{selectedRoom.roomNumber}</p></div>
                  <div className="text-right"><p className="text-4xl font-black text-gray-900">₹{selectedRoom.pricePerNight}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Per Night</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <Facility icon={<Wifi size={18}/>} label="Fast Wi-Fi" /><Facility icon={<Wind size={18}/>} label="Climate Control" />
                  <Facility icon={<Tv size={18}/>} label="Smart TV" /><Facility icon={<Coffee size={18}/>} label="Mini Bar" />
                </div>
                <button onClick={() => setShowForm(true)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-2xl hover:bg-blue-600 transition-all active:scale-95">Reserve Sanctuary</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {rooms.map((room) => (
              <div key={room.roomID} onClick={() => setSelectedRoom(room)} className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                <div className="h-64 overflow-hidden relative">
                  <img src={DEFAULT_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Room" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-2xl font-black text-sm text-gray-900 shadow-sm">₹{room.pricePerNight}</div>
                </div>
                <div className="p-8"><div className="flex items-center gap-2 mb-2">{[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-yellow-400 text-yellow-400" />)}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.roomTypeName}</h3><div className="flex justify-between items-center text-gray-400 text-[10px] font-black uppercase tracking-[0.1em]"><span>Suite #{room.roomNumber}</span><span className="bg-slate-50 px-2 py-1 rounded-md">Max {room.maxOccupancy} Guests</span></div></div>
              </div>
            ))}
          </div>
        )}

        {/* --- TRACK MY STAY (GUEST PROFILE AREA) --- */}
        <div id="my-profile-section" className="mt-32 pt-20 border-t border-gray-200">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">Track My Stay</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Access your reservations and stay details instantly</p>
            </div>
            <div className="max-w-2xl mx-auto bg-white p-4 rounded-[2.5rem] shadow-xl flex items-center gap-4 border border-gray-100 mb-16">
                <div className="flex-1 relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                    <input type="email" placeholder="Enter your registered email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="w-full bg-gray-50 p-5 pl-14 rounded-3xl outline-none font-bold text-sm" />
                </div>
                <button onClick={handleFetchHistory} disabled={fetchingHistory} className="bg-gray-900 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-gray-100">
                    {fetchingHistory ? "..." : "Retrieve Stays"}
                </button>
            </div>
            {myBookings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-700">
                    {myBookings.map((b) => (
                        <div key={b.bookingId} className="bg-white border border-gray-100 p-10 rounded-[3rem] shadow-sm flex flex-col hover:shadow-xl transition-all relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl mb-3 inline-block font-mono">#{b.bookingId}</span>
                                  <h4 className="text-2xl font-black text-gray-900">Room {b.roomNumber}</h4>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${b.bookingStatus === "Booked" ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20" : "bg-gray-100 text-gray-600"}`}>
                                  {b.bookingStatus}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-gray-500 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-8">
                                <div className="text-center"><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Check In</p><p className="text-sm font-black text-gray-900">{new Date(b.checkInDate).toLocaleDateString()}</p></div>
                                <ArrowLeft className="rotate-180 text-blue-200" size={24} />
                                <div className="text-center"><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Check Out</p><p className="text-sm font-black text-gray-900">{new Date(b.checkOutDate).toLocaleDateString()}</p></div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                  <UserCircle size={20}/>
                                </div>
                                <span className="text-xs font-black text-gray-500 uppercase tracking-tighter">{b.guestName}</span>
                              </div>
                              <p className="text-xl font-black text-gray-900 tracking-tighter">₹{b.totalAmount?.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {/* REGISTRATION MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !bookingLoading && setShowForm(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[95vh] overflow-y-auto border border-white/20">
            {bookingSuccess ? (
              <div className="text-center py-10"><div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500"><CheckCircle size={48} /></div><h2 className="text-3xl font-black text-gray-900 mb-2">Reserved!</h2><p className="text-gray-500 mt-2">Your suite is waiting for you.</p></div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-start"><div><h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Guest Details</h2><p className="text-blue-600 text-xs font-black uppercase tracking-widest mt-2">{selectedRoom.roomTypeName} • Room #{selectedRoom.roomNumber}</p></div><button onClick={() => setShowForm(false)} className="p-3 hover:bg-gray-100 rounded-full text-gray-400"><X size={24}/></button></div>
                {apiError && <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3 animate-shake"><AlertCircle size={16} /> {apiError}</div>}
                <div className="space-y-4">
                   <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Legal Name</label><input value={guestForm.fullName} onChange={(e) => setGuestForm({...guestForm, fullName: e.target.value})} className="w-full bg-gray-50 p-5 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border border-transparent focus:bg-white focus:border-blue-100 transition-all" placeholder="John Doe" /></div>
                   <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label><input type="email" value={guestForm.email} onChange={(e) => setGuestForm({...guestForm, email: e.target.value})} className="w-full bg-gray-50 p-5 rounded-[1.5rem] outline-none font-bold" placeholder="john@doe.com" /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phone</label><input type="tel" value={guestForm.phone} onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})} className="w-full bg-gray-50 p-5 rounded-[1.5rem] outline-none font-bold" placeholder="+91..." /></div></div>
                   <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Address</label><input value={guestForm.address} onChange={(e) => setGuestForm({...guestForm, address: e.target.value})} className="w-full bg-gray-50 p-5 rounded-[1.5rem] outline-none font-bold" placeholder="Full Residence" /></div>
                   <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">ID Type</label><select value={guestForm.idproofType} onChange={(e) => setGuestForm({...guestForm, idproofType: e.target.value})} className="w-full bg-gray-50 p-5 rounded-[1.5rem] border-none font-bold appearance-none"><option>Aadhar</option><option>Passport</option><option>Voter ID</option></select></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">ID Number</label><input value={guestForm.idproofNumber} onChange={(e) => setGuestForm({...guestForm, idproofNumber: e.target.value})} className="w-full bg-gray-50 p-5 rounded-[1.5rem] outline-none font-bold" placeholder="ID Number" /></div></div>
                </div>
                <div className="pt-4"><button onClick={handleFinalBooking} disabled={bookingLoading || !guestForm.fullName} className="w-full py-6 bg-blue-600 text-white rounded-[1.8rem] font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase text-xs tracking-widest">{bookingLoading ? "Securing Stay..." : <><CreditCard size={20}/> Confirm & Reserve</>}</button><p className="text-[10px] text-center text-gray-400 mt-5 font-bold uppercase tracking-widest flex items-center justify-center gap-1"><ShieldCheck size={10} /> Secure Booking Enabled</p></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Facility = ({ icon, label }) => (
  <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-blue-50 transition-colors">
    <div className="text-blue-500 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{label}</span>
  </div>
);

export default Home;
