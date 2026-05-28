import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-6 font-sans select-none mt-auto">
      <div className="w-full px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="text-slate-800 font-bold">SerenStay</span>
          <span className="text-slate-200">|</span>
          <span className="text-blue-600">v2.0.4</span>
          <span className="text-slate-200">|</span>
          <span className="text-slate-200">|</span>
          <span className="font-semibold text-slate-500">Next-Gen Unified Hotel Management Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium text-center sm:text-right">
          © {new Date().getFullYear()} SerenStay Global Operations. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;