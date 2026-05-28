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
    role: "Manager", 
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
      const errData = error.response?.data;
      let errorMsg = "Registration failed.";
      
      if (errData) {
        if (typeof errData === "string") {
          errorMsg = errData;
        } else if (errData.errors) {
          // Extract specific validation error messages from dictionary of arrays
          const errorList = Object.values(errData.errors).flat();
          errorMsg = errorList.length > 0 ? errorList[0] : "Validation failed.";
        } else if (errData.message) {
          errorMsg = errData.message;
        } else if (errData.title) {
          errorMsg = errData.title;
        }
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 p-4 font-sans overflow-hidden">
      <div className="max-w-2xl w-full h-[95vh] md:h-auto md:max-h-[90vh] bg-white rounded-[24px] shadow-2xl shadow-blue-100/50 flex flex-col md:flex-row border border-white overflow-hidden">
        
        {/* Left Side: SerenStay Branding */}
        <div className="md:w-[45%] bg-blue-600 relative p-8 flex flex-col justify-between text-white overflow-hidden">
          {/* Simple, standard background elements */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-700/40 rounded-full"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-8 text-sm font-bold">
               <ArrowLeft size={16} /> Back to Homepage
            </Link>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
                  <Hotel size={22} strokeWidth={2.5} />
               </div>
               <h1 className="text-2xl font-bold tracking-tight">Seren<span className="text-blue-200">Stay</span></h1>
            </div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold leading-tight mb-4">
              Staff Registration
            </h2>
            <p className="text-blue-50 text-sm font-medium opacity-95 leading-relaxed">
              Join us in delivering unforgettable stays.
            </p>
          </div>

          <div className="relative z-10 text-[10px] font-bold tracking-[0.2em] text-blue-200 uppercase">
             Staff Registration Portal v2.0
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[55%] p-6 md:p-8 bg-white flex flex-col justify-center overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h3>
            <p className="text-gray-400 text-xs font-medium mt-1">Join the SerenStay internal team.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input
                  name="fullName"
                  type="text"
                  placeholder="Alexander Pierce"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Staff Username</label>
              <div className="relative group">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input
                  name="username"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. alex_serene"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 outline-none cursor-pointer appearance-none font-bold text-gray-700 text-sm"
                required
              >
                <option value="Manager">Manager</option>
                <option value="Receptionist">Receptionist</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 p-3 pl-10 pr-10 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Complete Registration
                  <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500 font-medium">
            Already part of the team? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;