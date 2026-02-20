// import { Outlet } from "react-router-dom";
// import Navbar from "../components/common/Navbar";
// import Footer from "../components/common/Footer";

// const GuestLayout = () => {
//   return (
//     <>
//       <Navbar />
//       <main className="min-h-screen">
//         <Outlet />
//       </main>
//       <Footer />
//     </>
//   );
// };

// export default GuestLayout;


import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const GuestLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      {/* We use grow to push the footer down 
          and remove p-6 here so the Home hero can be full-width 
      */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default GuestLayout;