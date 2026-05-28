import { useEffect, useState } from "react";
import { getAllInvoices, downloadInvoicePdf, settleBalance } from "../../api/invoice.api";
import { Download, User, CheckCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // --- PAGINATION & SEARCH STATES ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    loadInvoices();
  }, [page, search]); // Re-fetch when page or search changes

  const loadInvoices = async () => {
    try {
      setLoading(true);
      // Pass pagination params to the API matching your updated backend
      const res = await getAllInvoices(page, pageSize, search);
      
      // Update states based on PagedResponse<T> structure
      setInvoices(res.data.data || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleSettle = async (invoice) => {
    const remainingBalance = invoice.balanceAmount || 0;
    if (!window.confirm(`Collect Full Payment of ₹${remainingBalance.toLocaleString()} and Settle Invoice?`)) return;
    
    try {
      setActionLoading(invoice.invoiceId);
      await settleBalance(invoice.invoiceId);
      toast.success("Full payment received. Invoice settled!");
      await loadInvoices(); 
    } catch (error) {
      toast.error("Failed to settle balance");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async (invoiceId) => {
    try {
      const response = await downloadInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Invoices & Billing</h1>
          <p className="text-gray-500 mt-1">Manage final settlements and checkout payments.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search guest or ID..."
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
          <p className="mt-4 text-gray-500 font-medium">Loading financial records...</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Invoice ID", "Guest", "Total Charges", "Paid", "Pending", "Status", "Actions"].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.invoiceId} className="hover:bg-blue-50/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{invoice.invoiceId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">{invoice.guestName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                      ₹{(invoice.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      ₹{(invoice.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${(invoice.balanceAmount || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ₹{(invoice.balanceAmount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          invoice.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {(invoice.balanceAmount || 0) > 0 && invoice.paymentStatus !== "Paid" && new Date(invoice.checkOutDate) <= new Date() && (
                          <button 
                            onClick={() => handleSettle(invoice)} 
                            disabled={actionLoading === invoice.invoiceId}
                            className={`flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-100 transition-all font-bold ${actionLoading === invoice.invoiceId ? 'opacity-50' : ''}`}
                          >
                            <CheckCircle size={14} /> 
                            {actionLoading === invoice.invoiceId ? "..." : "Settle Balance"}
                          </button>
                        )}
                        <button onClick={() => handleDownloadPdf(invoice.invoiceId)} className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg border border-blue-100 transition-all">
                          <Download size={14} /> PDF
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
              Showing <span className="text-gray-900">{invoices.length}</span> of <span className="text-gray-900">{totalRecords}</span> results
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
    </div>
  );
};

export default Invoices;