const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 opacity-60">
          <h1 className="text-lg font-black text-slate-800 tracking-tighter uppercase">
            Serene<span className="text-blue-600">Stay</span>
          </h1>
        </div>
        
        <p className="text-slate-400 text-xs font-medium tracking-wide">
          © {new Date().getFullYear()} SereneStay Management. All rights reserved.
        </p>

        <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Terms</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;