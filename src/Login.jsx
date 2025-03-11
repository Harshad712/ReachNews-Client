import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import nhost from "./nhost";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      await nhost.auth.signOut(); // Ensure previous session is cleared
  
      const response = await nhost.auth.signIn({
        email,
        password,
        allowedRoles: ["user"],
        defaultRole: "user",
      });
  
      if (response.error) {
        setError(response.error.message || "Invalid email or password.");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };
  
  
  return (
    <div className="auth-container">
      <h1 className="auth-title">ReachNews</h1>
      <p className="auth-subtitle">Sign in to continue</p>

      {error && <div className="error-message">{error}</div>}

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
          required
        />
        <button type="submit" className="auth-button">
          Sign In
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Don't have an account?{" "}
        <Link to="/signup" className="auth-link">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default Login;
