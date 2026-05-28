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

      // Based on your AuthService: response.data contains { token, user: { role, fullName, ... } }
      if (response.data && response.data.token) {
        const { token, user } = response.data;

        // 1. Store Security Token
        localStorage.setItem("token", token);
        
        // 2. Store Role-Based Access Info (Crucial for RBAC)
        localStorage.setItem("userRole", user.role); 
        
        // 3. Store Display Info
        localStorage.setItem("userName", user.fullName);
        
        toast.success(`Welcome to SerenStay, ${user.fullName}!`);
        
        // Redirect to protected dashboard
        navigate("/staff/dashboard");
      }
    } catch (error) {
      // Handles both 401 Unauthorized and network errors
      const errorMsg = error.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[24px] shadow-2xl shadow-blue-100/50 overflow-hidden flex flex-col md:flex-row border border-white">
        
        {/* Left Side: Branding */}
        <div className="md:w-[45%] bg-blue-600 relative p-8 flex flex-col justify-between text-white overflow-hidden">
          {/* Simple, standard background elements */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-700/40 rounded-full"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-8 text-sm font-bold group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
               Back to Guest Site
            </Link>

            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
                  <Hotel size={22} strokeWidth={2.5} />
               </div>
               <h1 className="text-2xl font-bold tracking-tight">Seren<span className="text-blue-200">Stay</span></h1>
            </div>
            <div className="h-1 w-10 bg-blue-300 mt-4 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold leading-tight mb-4">
              Staff Portal
            </h2>
            <p className="text-blue-50 text-sm font-medium opacity-95 leading-relaxed">
              Your portal to premium guest services.
            </p>
          </div>

          <div className="relative z-10 text-xs font-bold tracking-[0.2em] text-blue-200 uppercase">
             SerenStay Premium Hotel Suite v2.0
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[55%] p-6 md:p-8 bg-white flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Sign In</h3>
            <p className="text-gray-400 text-xs font-medium mt-1">Enter your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-gray-700 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-3 pl-10 pr-10 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-gray-700 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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

          <div className="mt-6 text-center border-t border-gray-50 pt-6">
            <p className="text-xs text-gray-500 font-medium">New to the team?</p>
            <Link to="/register" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm text-xs">
              <UserPlus size={16} /> Create Staff Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;