import { useEffect, useState } from "react";
import { getAllStaff, addStaff, updateStaff, deleteStaff } from "../../api/staff.api";
import { UserPlus, Shield, Edit3, Trash2, X, User, Fingerprint, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const Staff = () => {
  // --- ROLE ACCESS ---
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "Admin" || userRole === "Manager";
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // --- PAGINATION & SEARCH STATES ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "",
  });

  // Re-fetch data whenever page or search changes
  useEffect(() => {
    loadStaff();
  }, [page, search]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      // Pass pagination params to the API
      const res = await getAllStaff(page, pageSize, search);
      
      // Update states based on PagedResponse structure
      setStaff(res.data.data || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to load staff");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.staffId, formData);
        toast.success("Staff updated successfully");
      } else {
        await addStaff(formData);
        toast.success("Staff added successfully");
      }
      loadStaff();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      username: staffMember.username,
      password: "",
      fullName: staffMember.fullName,
      role: staffMember.role,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await deleteStaff(id);
        toast.success("Staff deleted successfully");
        loadStaff();
      } catch (error) {
        toast.error("Failed to delete staff");
      }
    }
  };

  const resetForm = () => {
    setFormData({ username: "", password: "", fullName: "", role: "" });
    setEditingStaff(null);
    setShowModal(false);
  };

  const getRoleStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 ring-1 ring-purple-600/20';
      case 'manager': return 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20';
      case 'receptionist': return 'bg-green-100 text-green-700 ring-1 ring-green-600/20';
      default: return 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Personnel Directory
          </h1>
          <p className="text-gray-500 mt-1">Manage system access, security roles, and team credentials.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search name, user or role..."
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
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all font-bold text-sm"
              >
                <UserPlus size={18} /> Add Member
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading directory...</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Team Member", "Account ID", "Access Role", "Actions"].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {staff.map((s) => (
                  <tr key={s.staffId} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <User size={18} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Fingerprint size={14} className="text-gray-300" />
                        {s.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getRoleStyle(s.role)}`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isAdmin ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(s)}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-blue-100"
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(s.staffId)}
                            className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-red-100"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">View Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* --- PAGINATION FOOTER --- */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900">{staff.length}</span> of <span className="text-gray-900">{totalRecords}</span> results
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={resetForm} 
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="text-blue-600" size={24} />
                {editingStaff ? "Update Member" : "New Account"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Configure staff details and permissions.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Form inputs remain the same logic-wise */}
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
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="johndoe_admin"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder={editingStaff ? "Leave blank to keep current" : "Min. 6 characters"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required={!editingStaff}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Access Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select a role...</option>
                  <option value="Manager">Manager</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
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
                  {editingStaff ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;