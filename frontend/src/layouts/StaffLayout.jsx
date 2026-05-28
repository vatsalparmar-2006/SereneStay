import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";

const StaffLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Unified Top Header across entire project */}
      <Navbar />
      
      {/* Sidebar + Content layout */}
      <div className="flex flex-row flex-grow">
        <Sidebar />
        <main className="flex-grow p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Full width footer spanning underneath everything including sidebar */}
      <Footer />
    </div>
  );
};

export default StaffLayout;