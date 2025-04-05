// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { loginUser, signupUser } from "../services/api";
// import { createCometChatUser } from "../services/cometchat";
// import { CometChat } from "@cometchat-pro/chat";
// import { COMETCHAT_CONFIG } from "../utils/config";

// const Login = ({ setUser }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [isSignup, setIsSignup] = useState(false);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setIsLoading(true);

//     try {
//       if (isSignup) {
//         console.log("🔹 Signup Request:", { username, email, password });
//         const signupResponse = await signupUser({ username, email, password });

//         console.log("✅ Signup Success:", signupResponse.data);
//         try {
//           await createCometChatUser(username, username);
//           alert("Signup successful! Now login.");
//           setIsSignup(false);
//           // Pre-fill the email field for better UX
//           setEmail(email);
//           setPassword("");
//         } catch (cometChatError) {
//           console.error("❌ CometChat user creation failed:", cometChatError);
//           setError("Failed to setup chat capabilities. Please try again.");
//         }
//       } else {
//         console.log("🔹 Login Request:", { email, password });
//         const res = await loginUser({ email, password });

//         if (res?.data?.token && res?.data?.user) {
//           console.log("✅ Login Response:", res.data);
          
//           // Store token and user info before CometChat login
//           localStorage.setItem("auth-token", res.data.token);
//           localStorage.setItem("user", JSON.stringify(res.data.user));
          
//           // CometChat login
//           if (res.data.user.cometchatUID) {
//             try {
//               const cometChatUser = await CometChat.login(
//                 res.data.user.cometchatUID, 
//                 COMETCHAT_CONFIG.AUTH_KEY
//               );
//               console.log("✅ CometChat Login Successful:", cometChatUser);
//             } catch (cometChatError) {
//               console.error("❌ CometChat Login Failed:", cometChatError);
//               // Don't block the app login if CometChat fails
//               console.warn("Continuing without CometChat login");
//             }
//           } else {
//             console.warn("No CometChat UID found, skipping CometChat login");
//           }
          
//           // Set user in app state
//           setUser(res.data.user);
          
//           // Navigate to home page
//           navigate("/");
//         } else {
//           setError("Invalid response from server");
//         }
//       }
//     } catch (error) {
//       console.error("❌ Error in Auth Flow:", error.response ? error.response.data : error);
//       setError(error.response ? error.response.data.message : "Something went wrong");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>{isSignup ? "Create Account" : "Login"}</h2>
//       {error && <p className="error-message">{error}</p>}
//       <form onSubmit={handleSubmit}>
//         {isSignup && (
//           <div className="form-group">
//             <input 
//               type="text" 
//               placeholder="Username" 
//               value={username}
//               onChange={(e) => setUsername(e.target.value)} 
//               required
//               className="form-input"
//             />
//           </div>
//         )}
//         <div className="form-group">
//           <input 
//             type="email" 
//             placeholder="Email" 
//             value={email}
//             onChange={(e) => setEmail(e.target.value)} 
//             required
//             className="form-input"
//           />
//         </div>
//         <div className="form-group">
//           <input 
//             type="password" 
//             placeholder="Password" 
//             value={password}
//             onChange={(e) => setPassword(e.target.value)} 
//             required
//             className="form-input"
//           />
//         </div>
//         <button 
//           type="submit" 
//           className="submit-button"
//           disabled={isLoading}
//         >
//           {isLoading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
//         </button>
//       </form>
//       <p 
//         onClick={() => setIsSignup(!isSignup)} 
//         className="toggle-auth-mode"
//       >
//         {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
//       </p>
//     </div>
//   );
// };

// export default Login;



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser, testBcrypt } from "../services/api";
import { createCometChatUser } from "../services/cometchat";
import { CometChat } from "@cometchat-pro/chat";
import { COMETCHAT_CONFIG } from "../utils/config";
import '../pagesCss/Login.css';
import { forgotPassword } from "../services/api";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState(localStorage.getItem("signup-email") || "");
  const [password, setPassword] = useState(localStorage.getItem("signup-password") || "");
  const [username, setUsername] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();




  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      setMessage("Password reset link sent to your email");
      setIsForgotPassword(false);
    } catch (error) {
      setError(error.response ? error.response.data.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
  
      try {
        if (isSignup) {
          console.log("🔹 Signup Request:", { username, email, password });
  
          try {
            const testResult = await testBcrypt({ password });
            console.log("📊 Bcrypt Test Result:", testResult.data);
          } catch (err) {
            console.warn("⚠️ Bcrypt test failed:", err);
          }
  
          const signupResponse = await signupUser({ username, email, password });
          console.log("✅ Signup Success:", signupResponse.data);
  
          await createCometChatUser(username, username);
  
          localStorage.setItem("signup-email", email);
          localStorage.setItem("signup-password", password);
  
          alert("Signup successful! Please log in with your credentials.");
          setIsSignup(false);
        } else {
          console.log("🔹 Login Request:", { email, password });
          const res = await loginUser({ email, password });
  
          if (res?.data?.token && res?.data?.user) {
            const user = res.data.user;
  
            console.log("✅ Login Response:", user);
            console.log("🖼️ Received profilePic:", user.profilePic);
  
            localStorage.setItem("auth-token", res.data.token);
            localStorage.setItem("user", JSON.stringify(user));
  
            localStorage.removeItem("signup-email");
            localStorage.removeItem("signup-password");
  
            if (user.cometchatUID) {
              try {
                await CometChat.login(user.cometchatUID, COMETCHAT_CONFIG.AUTH_KEY);
                console.log("✅ CometChat Login Successful");
              } catch (cometChatError) {
                console.error("❌ CometChat Login Failed:", cometChatError);
              }
            }
  
            setUser(user);
            navigate("/");
          } else {
            setError("Invalid response from server");
          }
        }
      } catch (error) {
        console.error("❌ Auth Error:", error.response ? error.response.data : error);
        setError(error.response ? error.response.data.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="auth-container">
      <h2>
        {isForgotPassword 
          ? "Forgot Password" 
          : (isSignup ? "Create Account" : "Login")
        }
      </h2>
      
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      
      <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
        {/* Existing form fields */}
        <div className="form-group">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required
            className="form-input"
          />
        </div>

        {!isForgotPassword && (
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="form-input"
            />
          </div>
        )}

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading 
            ? "Processing..." 
            : (isForgotPassword 
              ? "Send Reset Link" 
              : (isSignup ? "Sign Up" : "Login"))
          }
        </button>
      </form>

      {!isForgotPassword && (
        <div className="auth-links">
          <p 
            onClick={() => setIsSignup(!isSignup)} 
            className="toggle-auth-mode"
          >
            {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </p>
          <p 
            onClick={() => setIsForgotPassword(true)} 
            className="forgot-password-link"
          >
            Forgot Password?
          </p>
        </div>
      )}

      {isForgotPassword && (
        <p 
          onClick={() => setIsForgotPassword(false)} 
          className="back-to-login"
        >
          Back to Login
        </p>
      )}
    </div>
  );
};

export default Login;