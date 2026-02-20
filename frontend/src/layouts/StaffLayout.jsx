import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";

const StaffLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;