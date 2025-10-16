import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PasswordReset = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username) {
      alert("Please enter a username");
      return;
    }
    
    setLoading(true);
    try {
      // Send username to the new backend endpoint
      await axios.post(
        `${API_BASE_URL}/api/reset-link-email/`,
        { username },
        { withCredentials: true }
      );
     // Show success modal instead of alert
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert("Error sending reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Redirect to login page
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6">
        {/* Blue circular icon */}
        <div className="text-center mb-8">
          <div className="bg-white-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="NtLogo.webp" alt="Logo" className="w-30 h-30 object-contain" />
          </div>
         
        </div>
        
        {/* Title and description */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">Enter your username to receive a password reset link in your registered email</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Sending Reset Email
              </>
            ) : (
              "Send Reset Email"
            )}
          </button>
        </form>
        
        {/* Back to Sign In link */}
        <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
               Back to Sign In
            </Link>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <div className="flex justify-center mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">
              Password reset email sent to your registered email address
            </p>
            <button
              onClick={handleModalClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordReset;