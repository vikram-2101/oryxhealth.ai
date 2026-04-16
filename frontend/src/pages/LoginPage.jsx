import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import logo from "../assets/logo.png";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      success("Login successful!");
      navigate("/");
    } catch (err) {
      error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-3xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="OryxTHealth Logo"
            className="h-28 mx-auto mb-4"
          />

          <p className="text-slate-600 font-medium">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="floating-label-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              className="floating-label-input"
            />
            <label className="floating-label">Email Address</label>
          </div>

          <div className="floating-label-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              className="floating-label-input"
            />
            <label className="floating-label">Password</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Sign In"}
          </button>
        </form>

        {/* <div className="mt-6 text-center text-sm text-slate-500">
          <p>Default credentials:</p>
          <p className="font-mono text-xs mt-1">admin@oxyhealth.ai / admin123</p>
        </div> */}
      </motion.div>
    </div>
  );
};
