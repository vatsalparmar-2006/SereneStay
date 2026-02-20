import { useEffect, useState } from "react";
import { getAllBookingsWithInvoices, deleteBooking } from "../../api/booking.api";
import toast from "react-hot-toast";
// Note: If you have Lucide React or FontAwesome, you can replace text with icons
import { Trash2, Calendar, User, Hash } from "lucide-react"; 

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookingsWithInvoices();
      setBookings(res.data);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
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

  const formatDate = (dateString) => {
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
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Total Bookings: </span>
            <span className="text-blue-600 font-bold">{bookings.length}</span>
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
                  {/* Updated Header: "Payment (Paid/Due)" to replace "Invoice" */}
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
                        #{booking.bookingId}
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
                            ? "bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20"
                            : "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.invoiceId ? (
                        <div className="flex flex-col">
                          {/* Showing Paid vs Remaining Balance */}
                          <span className="text-sm font-bold text-emerald-600">
                            Paid: ₹{booking.paidAmount?.toLocaleString()}
                          </span>
                          <span
                            className={`text-[10px] uppercase tracking-wider font-extrabold ${
                              booking.paymentStatus === "Paid"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            ● {booking.paymentStatus} (Due: ₹{(booking.totalAmount - booking.paidAmount).toLocaleString()})
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                           <span className="text-blue-600 text-sm font-bold">₹500.00</span>
                           <span className="text-gray-400 italic text-[10px] uppercase font-bold tracking-tight">Advance Collected</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(booking.bookingId)}
                        className="group flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-red-100"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <div className="py-12 text-center">
                <p className="text-gray-400">No bookings found in the database.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookings;