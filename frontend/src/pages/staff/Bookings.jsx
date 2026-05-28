import { useEffect, useState } from "react";
import { getAllBookingsWithInvoices, deleteBooking } from "../../api/booking.api";
import { addInvoice, settleBalance } from "../../api/invoice.api";
import toast from "react-hot-toast";
import { Trash2, Search, ChevronLeft, ChevronRight, CheckCircle, PlusCircle, X, ConciergeBell, DoorOpen } from "lucide-react"; 
import { getAllServices } from "../../api/service.api";
import { addServiceUsage } from "../../api/serviceUsage.api";
import { useNavigate } from "react-router-dom"; 

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settleLoading, setSettleLoading] = useState(null);
  const navigate = useNavigate(); 

  // --- SERVICE MODAL STATES ---
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({ serviceId: "", quantity: 1 });
  const [serviceLoading, setServiceLoading] = useState(false);

  // --- ROLE ACCESS ---
  const userRole = localStorage.getItem("userRole"); 
  const canDelete = userRole === "Admin" || userRole === "Manager";

  // --- PAGINATION & SEARCH STATES ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    loadBookings();
  }, [page, search]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookingsWithInvoices(page, pageSize, search);
      setBookings(res.data.data || []); 
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleDelete = async (id) => {
    if (!canDelete) {
      toast.error("Access Denied: Only Admins can delete records.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await deleteBooking(id);
        toast.success("Booking deleted successfully");
        loadBookings();
      } catch (error) {
        toast.error("Failed to delete booking");
      }
    }
  };

  // --- SETTLE: Create Invoice (if needed) + Settle Balance ---
  const handleSettle = async (booking) => {
    if (!window.confirm(`Finalize checkout for ${booking.guestName} (Booking ${booking.bookingId})?\nCollect Balance: ₹${(booking.totalAmount - booking.paidAmount).toLocaleString()}`)) return;
    try {
      setSettleLoading(booking.bookingId);
      let invoiceId = booking.invoiceId;

      // Step 1: Create invoice if one doesn't exist
      if (!invoiceId) {
        const invoiceRes = await addInvoice({
          BookingId: booking.bookingId,
          PaymentMethod: "Cash"
        });
        invoiceId = invoiceRes.data.invoiceId;
      }

      // Step 2: Settle the invoice (marks as fully paid + updates booking status)
      await settleBalance(invoiceId);
      toast.success("Guest Checked Out & Invoice Settled!");
      loadBookings();
    } catch (error) {
      const errData = error.response?.data;
      const errMsg = errData?.message || (typeof errData === 'string' ? errData : "Failed to settle booking");
      toast.error(errMsg);
    } finally {
      setSettleLoading(null);
    }
  };

  // --- ADD SERVICE TO BOOKING ---
  const handleOpenServiceModal = async (bookingId) => {
    setSelectedBookingId(bookingId);
    setServiceForm({ serviceId: "", quantity: 1 });
    setShowServiceModal(true);

    if (availableServices.length === 0) {
      try {
        const res = await getAllServices(1, 100, "");
        setAvailableServices(res.data.data || []);
      } catch (error) {
        toast.error("Failed to load available services");
      }
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!serviceForm.serviceId || serviceForm.quantity <= 0) {
        toast.error("Please select a valid service and quantity.");
        return;
    }
    
    try {
        setServiceLoading(true);
        await addServiceUsage({
            BookingId: selectedBookingId,
            ServiceId: parseInt(serviceForm.serviceId),
            Quantity: parseInt(serviceForm.quantity)
        });
        
        toast.success("Service added to booking successfully!");
        setShowServiceModal(false);
        loadBookings(); 
    } catch (error) {
        const errData = error.response?.data;
        const errMsg = errData?.message || (typeof errData === 'string' ? errData : "Failed to add service");
        toast.error(errMsg);
    } finally {
        setServiceLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Bookings Management
          </h1>
          <p className="text-gray-500 mt-1">Manage guest stays, invoices, and room statuses.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search guest name or status..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm"
            />
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 hidden md:block">
            <span className="text-sm font-medium text-gray-600">Total: </span>
            <span className="text-blue-600 font-bold">{totalRecords}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500 font-medium">Fetching records...</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Booking ID", "Guest", "Room", "Schedule", "Status", "Payment Status", "Actions"].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.bookingId} className="hover:bg-blue-50/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {booking.bookingId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{booking.guestName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded border border-gray-200">
                            Room {booking.roomNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><span className="font-medium">In:</span> {formatDate(booking.checkInDate)}</p>
                        <p><span className="font-medium">Out:</span> {formatDate(booking.checkOutDate)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          booking.bookingStatus === "Booked"
                            ? "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-600/20" 
                            : "bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20"
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                    
                    {/* --- CONSISTENT 3-LINE FINANCIAL UI --- */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col w-36 gap-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-bold">Total:</span>
                          <span className="text-slate-900 font-black">₹{booking.totalAmount?.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs mb-1">
                          {/* Changed "Advance" to "Paid" to avoid confusion on settled bills */}
                          <span className="text-slate-500 font-bold">Paid:</span>
                          <span className="text-emerald-600 font-black">₹{booking.paidAmount?.toLocaleString()}</span>
                        </div>
                        
                        <div className="h-px w-full bg-slate-200 my-0.5"></div>
                        
                        <div className="flex justify-between text-xs">
                          {/* Changed "Pending" to "Balance" */}
                          <span className="text-slate-500 font-bold">Pending:</span>
                          <span className={`${booking.paymentStatus === "Paid" ? 'text-emerald-600' : 'text-rose-600'} font-black`}>
                            ₹{(booking.totalAmount - booking.paidAmount)?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        {/* Add Service Button (For active bookings) */}
                        {booking.paymentStatus !== "Paid" && (
                           <button
                             onClick={() => handleOpenServiceModal(booking.bookingId)}
                             className="group flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-blue-100"
                           >
                             <PlusCircle size={14} />
                             <span>Add Service</span>
                           </button>
                        )}
                        
                        {/* Checkout & Settle Button */}
                        {booking.bookingStatus === "Booked" && booking.paymentStatus !== "Paid" && (
                          <button
                            onClick={() => handleSettle(booking)}
                            disabled={settleLoading === booking.bookingId}
                            className={`group flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-emerald-100 ${settleLoading === booking.bookingId ? 'opacity-50' : ''}`}
                          >
                            <DoorOpen size={14} />
                            <span>{settleLoading === booking.bookingId ? "..." : "Checkout"}</span>
                          </button>
                        )}
                        
                        {/* Delete Button (Admin/Manager only) */}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(booking.bookingId)}
                            className="group flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-red-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        
                        {/* Fallback for completely checked out and paid guests with no admin rights */}
                        {booking.bookingStatus !== "Booked" && booking.paymentStatus === "Paid" && !canDelete && (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">View Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION FOOTER --- */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900">{bookings.length}</span> of <span className="text-gray-900">{totalRecords}</span> results
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all text-gray-600"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center px-4 text-sm font-bold text-gray-700">
                Page {page} of {totalPages || 1}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all text-gray-600"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD SERVICE MODAL --- */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowServiceModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <ConciergeBell className="text-blue-600" size={24} />
                Add Service
              </h2>
              <p className="text-sm text-gray-500 mt-1">Assign an extra service to Booking {selectedBookingId}</p>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Select Service</label>
                <select
                  value={serviceForm.serviceId}
                  onChange={(e) => setServiceForm({ ...serviceForm, serviceId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="">-- Choose a Service --</option>
                  {availableServices.map((srv) => (
                    <option key={srv.serviceId} value={srv.serviceId}>
                      {srv.serviceName} (₹{srv.servicePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={serviceForm.quantity}
                  onChange={(e) => setServiceForm({ ...serviceForm, quantity: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceLoading}
                  className={`flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-sm ${serviceLoading ? 'opacity-70' : ''}`}
                >
                  {serviceLoading ? "Adding..." : "Add to Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;