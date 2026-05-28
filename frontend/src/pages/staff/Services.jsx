import { useEffect, useState } from "react";
import { getAllServices, addService, updateService, deleteService } from "../../api/service.api";
import { Plus, Edit3, Trash2, X, ConciergeBell, IndianRupee, Layers, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // --- ROLE VERIFICATION ---
  const userRole = localStorage.getItem("userRole");
  const isManagerOrAdmin = userRole === "Admin" || userRole === "Manager";

  // --- PAGINATION & SEARCH STATES ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  const [formData, setFormData] = useState({
    serviceName: "",
    servicePrice: "",
  });

  // Re-fetch whenever page or search changes
  useEffect(() => {
    loadServices();
  }, [page, search]);

  const loadServices = async () => {
    try {
      setLoading(true);
      // Pass pagination params to the API
      const res = await getAllServices(page, pageSize, search);
      
      // Update states based on PagedResponse structure
      setServices(res.data.data || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to load services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isManagerOrAdmin) {
      toast.error("Unauthorized: Only Managers and Admins can modify services.");
      return;
    }
    try {
      if (editingService) {
        await updateService(editingService.serviceId, formData);
        toast.success("Service updated successfully");
      } else {
        await addService(formData);
        toast.success("Service added successfully");
      }
      loadServices();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (service) => {
    if (!isManagerOrAdmin) {
      toast.error("Unauthorized: Only Managers and Admins can edit services.");
      return;
    }
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName,
      servicePrice: service.servicePrice,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!isManagerOrAdmin) {
      toast.error("Unauthorized: Only Managers and Admins can delete services.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(id);
        toast.success("Service deleted successfully");
        loadServices();
      } catch (error) {
        toast.error("Failed to delete service");
      }
    }
  };

  const resetForm = () => {
    setFormData({ serviceName: "", servicePrice: "" });
    setEditingService(null);
    setShowModal(false);
  };

  // Build headers dynamically based on role
  const tableHeaders = ["Service Name", "Base Price", "Status"];
  if (isManagerOrAdmin) {
    tableHeaders.push("Actions");
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Hotel Services
          </h1>
          <p className="text-gray-500 mt-1">Manage additional amenities, laundry, and room service pricing.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search services..."
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
            {isManagerOrAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all font-bold text-sm"
              >
                <Plus size={18} /> Add Service
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Fetching catalog...</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {services.map((service) => (
                  <tr key={service.serviceId} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
                          <ConciergeBell size={18} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{service.serviceName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        ₹{parseFloat(service.servicePrice).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20 uppercase">
                        Active
                      </span>
                    </td>
                    {isManagerOrAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(service)}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-blue-100"
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(service.serviceId)}
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
              Showing <span className="text-gray-900">{services.length}</span> of <span className="text-gray-900">{totalRecords}</span> results
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
                <ConciergeBell className="text-blue-600" size={24} />
                {editingService ? "Update Service" : "New Service"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Set the name and pricing for this hotel amenity.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Laundry / Spa"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Service Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <IndianRupee size={16} />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.servicePrice}
                    onChange={(e) => setFormData({ ...formData, servicePrice: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
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
                  {editingService ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;