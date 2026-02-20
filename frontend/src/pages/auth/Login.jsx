import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ShieldCheck, Hotel, UserPlus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { loginStaff } from "../../api/auth.api"; 

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await loginStaff({ username, password });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", response.data.user.fullName);
        localStorage.setItem("userRole", response.data.user.role);
        
        toast.success(`Welcome to SereneStay, ${response.data.user.fullName}!`);
        navigate("/staff/dashboard");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-[40px] shadow-2xl shadow-blue-100/50 overflow-hidden flex flex-col md:flex-row border border-white">
        
        {/* Left Side: SereneStay Branding */}
        <div className="md:w-[45%] bg-blue-600 relative p-12 flex flex-col justify-between text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
          
          <div className="relative z-10">
            {/* NEW: Back to Guest Site Link */}
            <Link to="/" className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-8 text-sm font-bold group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
               Back to Guest Site
            </Link>

            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
                  <Hotel size={22} strokeWidth={2.5} />
               </div>
               <h1 className="text-2xl font-black tracking-tighter uppercase">Serene<span className="text-blue-200">Stay</span></h1>
            </div>
            <div className="h-1 w-10 bg-blue-300 mt-4 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-5xl font-extrabold leading-tight mb-6">
              Experience <br />
              <span className="text-blue-200 underline decoration-white/30 underline-offset-8">Serenity.</span>
            </h2>
            <p className="text-blue-50 font-medium opacity-80 leading-relaxed">
              Access the SereneStay internal portal to coordinate guests, rooms, and staff.
            </p>
          </div>

          <div className="relative z-10 text-xs font-bold tracking-[0.2em] text-blue-200 uppercase">
             SereneStay Admin v2.0
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-[55%] p-8 md:p-20 bg-white">
          <div className="mb-12">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Staff Login</h3>
            <p className="text-gray-400 font-medium mt-2">Authorized personnel only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 pr-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-gray-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors"
                >
             
             
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Enter Dashboard
                  <ShieldCheck size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-50 pt-8">
            <p className="text-sm text-gray-500 font-medium">New to the team?</p>
            <Link to="/register" className="mt-2 inline-flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm">
              <UserPlus size={18} /> Create Staff Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;