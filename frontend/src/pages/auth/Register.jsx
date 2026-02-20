import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addStaff } from "../../api/staff.api"; 
import { Eye, EyeOff, Lock, User, Hotel, UserPlus, Fingerprint, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State matching your C# StaffCreateDTO precisely
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "Receptionist", 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic: Sending data to your [HttpPost("AddStaff")] C# endpoint
      const response = await addStaff(formData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success("Staff Registered Successfully!");
        navigate("/login"); // Redirect to login after success
      }
    } catch (error) {
      // Capture the FluentValidation errors or duplicate username errors from backend
      const errorMsg = error.response?.data?.message || error.response?.data || "Registration failed.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-[40px] shadow-2xl shadow-blue-100/50 overflow-hidden flex flex-col md:flex-row border border-white">
        
        {/* Left Side: SereneStay Branding */}
        <div className="md:w-[40%] bg-blue-600 relative p-12 flex flex-col justify-between text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-8 text-sm font-bold">
               <ArrowLeft size={16} /> Back to Homepage
            </Link>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
                  <Hotel size={22} strokeWidth={2.5} />
               </div>
               <h1 className="text-2xl font-black tracking-tighter uppercase">Serene<span className="text-blue-200">Stay</span></h1>
            </div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Empower <br />
              <span className="text-blue-200 underline decoration-white/30 underline-offset-8">Hospitality.</span>
            </h2>
            <p className="text-blue-50 font-medium opacity-80 leading-relaxed">
              Create your staff profile to start managing room inventories, guest check-ins, and luxury services.
            </p>
          </div>

          <div className="relative z-10 text-[10px] font-bold tracking-[0.2em] text-blue-200 uppercase">
             Staff Registration Portal v2.0
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[60%] p-8 md:p-16 bg-white">
          <div className="mb-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h3>
            <p className="text-gray-400 font-medium mt-1">Join the SereneStay internal management team.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  name="fullName"
                  type="text"
                  placeholder="Alexander Pierce"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Staff Username</label>
              <div className="relative group">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  name="username"
                  type="text"
                  placeholder="e.g. alex_serene"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Assign Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none cursor-pointer appearance-none font-bold text-gray-700"
                required
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Housekeeping">Housekeeping</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Security Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 pr-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Complete Registration
                  <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 font-medium">
            Already part of the team? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;