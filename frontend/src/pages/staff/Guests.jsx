import { useEffect, useState } from "react";
import { getAllGuests, addGuest, updateGuest, deleteGuest } from "../../api/guest.api";
import { Trash2, UserPlus, Mail, Phone, BadgeCheck, X, Edit3, User, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);

  // --- NEW PAGINATION & SEARCH STATES ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    idproofType: "",
    idproofNumber: "",
  });

  // Re-fetch data whenever page or search changes
  useEffect(() => {
    loadGuests();
  }, [page, search]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      // Passing page, pageSize, and search to match your updated backend
      const res = await getAllGuests(page, pageSize, search);
      
      // Update states based on PagedResponse<T> structure
      setGuests(res.data.data || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to load guests");
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        FullName: formData.fullName,
        Email: formData.email,
        Phone: formData.phone,
        Address: formData.address,
        IdproofType: formData.idproofType,
        IdproofNumber: formData.idproofNumber
      };

      if (editingGuest) {
        await updateGuest(editingGuest.guestId, payload);
        toast.success("Guest updated successfully");
      } else {
        await addGuest(payload);
        toast.success("Guest registered successfully");
      }
      loadGuests();
      resetForm();
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        responseData.errors.forEach(err => toast.error(err));
      } else {
        toast.error(responseData?.message || "Operation failed");
      }
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      fullName: guest.fullName,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      idproofType: guest.idproofType,
      idproofNumber: guest.idproofNumber,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this guest?")) {
      try {
        await deleteGuest(id);
        toast.success("Guest deleted successfully");
        loadGuests();
      } catch (error) {
        toast.error("Failed to delete guest");
      }
    }
  };

  const resetForm = () => {
    setFormData({ fullName: "", email: "", phone: "", address: "", idproofType: "", idproofNumber: "" });
    setEditingGuest(null);
    setShowModal(false);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Guest Directory
          </h1>
          <p className="text-gray-500 mt-1">Manage guest profiles, contact details, and identification.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 hidden md:block">
              <span className="text-sm font-medium text-gray-600">Total: </span>
              <span className="text-blue-600 font-bold">{totalRecords}</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all font-bold text-sm"
            >
              <UserPlus size={18} /> Register Guest
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading records...</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Guest Profile", "Contact Info", "ID Verification", "Joined Date", "Actions"].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {guests.map((guest) => (
                  <tr key={guest.guestId} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
                          <User size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{guest.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                          <Mail size={14} className="text-gray-400" /> {guest.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone size={14} className="text-gray-400" /> {guest.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-600/20 uppercase tracking-wider w-fit">
                          {guest.idproofType}
                        </span>
                        <span className="text-xs font-mono text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded w-fit">
                          {guest.idproofNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(guest.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(guest)}
                          className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-blue-100"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(guest.guestId)}
                          className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-red-100"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
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
              Showing <span className="text-gray-900">{guests.length}</span> of <span className="text-gray-900">{totalRecords}</span> results
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

      {/* Modern Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200">
            <button
              onClick={resetForm}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BadgeCheck className="text-blue-600" size={24} />
                {editingGuest ? "Update Profile" : "Guest Registration"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Verify and register guest identification details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">ID Type</label>
                  <select
                    value={formData.idproofType}
                    onChange={(e) => setFormData({ ...formData, idproofType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select ID Type</option>
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="PAN">PAN</option>
                    {/* <option value="Passport">Passport</option> */}
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">ID Number</label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-XXXX"
                    value={formData.idproofNumber}
                    onChange={(e) => setFormData({ ...formData, idproofNumber: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Address</label>
                <textarea
                  placeholder="Street name, City, State, Zip"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px]"
                  rows="2"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-sm"
                >
                  {editingGuest ? "Save Changes" : "Register Guest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;