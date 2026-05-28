import { useEffect, useState } from "react";
import {
  getAllRoomTypes,
  addRoomType,
  updateRoomType,
  deleteRoomType
} from "../../api/roomType.api";
import { Plus, Edit3, Trash2, Bed, X, Layers, Search, ChevronLeft, ChevronRight } from "lucide-react"; 
import toast from "react-hot-toast";

const RoomTypes = () => {
  // --- ROLE PERMISSION CHECK ---
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "Admin" || userRole === "Manager";

  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  const [formData, setFormData] = useState({
    typeName: "",
    bedCounts: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, [page, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllRoomTypes(page, pageSize, search);
      
      // FIXED: Correctly accessing data from the paginated response
      setRoomTypes(res.data.data || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to load room types");
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Only proceed if user is Admin
    if (!isAdmin) {
      toast.error("Access denied: Admins only.");
      return;
    }
    try {
      if (editingType) {
        await updateRoomType(editingType.roomTypeId, formData);
        toast.success("Room type updated successfully");
      } else {
        await addRoomType(formData);
        toast.success("Room type added successfully");
      }
      loadData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      typeName: type.typeName,
      bedCounts: type.bedCounts,
      description: type.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Role Check
    if (!isAdmin) {
      toast.error("Access denied.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this room type?")) {
      try {
        await deleteRoomType(id);
        toast.success("Room type deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete room type");
      }
    }
  };

  const resetForm = () => {
    setFormData({ typeName: "", bedCounts: "", description: "" });
    setEditingType(null);
    setShowModal(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Room Categories
          </h1>
          <p className="text-gray-500 mt-1">Define and manage luxury stay tiers and room configurations.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search types..."
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
            
            {/* ONLY SHOW ADD BUTTON TO ADMIN */}
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all font-bold text-sm"
              >
                <Plus size={18} /> Add Category
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Handle dynamic header count based on role */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bed Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  {isAdmin && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {roomTypes.map((type) => (
                  <tr key={type.roomTypeId} className="hover:bg-blue-50/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Bed size={18} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{type.typeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        {type.bedCounts} {type.bedCounts === 1 ? 'Bed' : 'Beds'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                        {type.description || "No description provided."}
                      </p>
                    </td>
                    {/* ONLY SHOW ACTION BUTTONS TO ADMIN */}
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(type)}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-blue-100"
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(type.roomTypeId)}
                            className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-red-100"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION FOOTER --- */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900">{roomTypes.length}</span> of <span className="text-gray-900">{totalRecords}</span> results
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

      {/* Modal - Restricted to Admin by handleSubmit but also hidden for safety */}
      {showModal && isAdmin && (
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
                <Layers className="text-blue-600" size={24} />
                {editingType ? "Update Category" : "New Category"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Define the properties for this room tier.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Type Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ultra Deluxe"
                  value={formData.typeName}
                  onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bed Capacity</label>
                <input
                  type="number"
                  placeholder="2"
                  value={formData.bedCounts}
                  onChange={(e) => setFormData({ ...formData, bedCounts: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
                <textarea
                  placeholder="Describe the amenities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                  rows="3"
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
                  {editingType ? "Save Changes" : "Create Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypes;