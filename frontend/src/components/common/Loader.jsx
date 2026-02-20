const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center py-20 space-y-4">
      <div className="relative">
        {/* Outer Ring */}
        <div className="h-12 w-12 rounded-full border-4 border-blue-50"></div>
        {/* Animated Inner Ring */}
        <div className="absolute top-0 h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-100"></div>
      </div>
      
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse ml-1">
        Preparing Experience
      </p>
    </div>
  );
};

export default Loader;