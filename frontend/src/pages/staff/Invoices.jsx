import { useEffect, useState } from "react";
import { getAllInvoices, downloadInvoicePdf, settleBalance } from "../../api/invoice.api";
import { FileText, Download, Receipt, User, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await getAllInvoices();
      setInvoices(res.data);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (id) => {
    try {
      await settleBalance(id);
      toast.success("Balance settled successfully");
      loadInvoices(); // Refresh the list
    } catch (error) {
      toast.error("Failed to settle balance");
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

  const formatDate = (dateString) => {
    if(!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Invoices & Billing</h1>
          <p className="text-gray-500 mt-1">Track guest payments, taxes, and generate PDF receipts.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Total Invoices: </span>
          <span className="text-blue-600 font-bold">{invoices.length}</span>
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
                  {["Invoice ID", "Guest", "Billing", "Paid (Token)", "Balance", "Status", "Actions"].map((header) => (
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
                      <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">#{invoice.invoiceId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">{invoice.guestName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ₹{invoice.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      ₹{invoice.paidAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${invoice.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ₹{invoice.balanceAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          invoice.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <div className="flex gap-2">
                        {invoice.balanceAmount > 0 && (
                          <button onClick={() => handleSettle(invoice.invoiceId)} className="flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-100 transition-all">
                            <CheckCircle size={14} /> Settle
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
        </div>
      )}
    </div>
  );
};

export default Invoices;