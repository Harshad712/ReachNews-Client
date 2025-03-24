import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import nhost from "./nhost";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      await nhost.auth.signOut(); // Ensure previous session is cleared
      const { session, error: loginError } = await nhost.auth.signIn({ email, password });
  
      if (loginError) {
        setError("Invalid email or password. Please try again.");
        console.error('Login error:', loginError.message);
        return;
      }
  
      if (session) {
        try {
          // First check if user exists in the database
          const checkUserResponse = await fetch(`${nhost.graphql.url}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.accessToken}`
            },
            body: JSON.stringify({
              query: `
                query GetUser($email: String!) {
                  user_profiles(where: { email: { _eq: $email } }) {
                    id
                    email
                  }
                }
              `,
              variables: { email }
            })
          });
  
          const checkResult = await checkUserResponse.json();
          
          if (!checkResult.data?.user_profiles?.length) {
            // User doesn't exist in the database, insert them
            const insertResponse = await fetch(`${nhost.graphql.url}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.accessToken}`
              },
              body: JSON.stringify({
                query: `
                  mutation InsertUser($email: String!) {
                    insert_user_profiles_one(object: { 
                      email: $email,
                      id: "${session.user.id}"
                    }) {
                      id
                      email
                    }
                  }
                `,
                variables: { email }
              })
            });
  
            const insertResult = await insertResponse.json();
            
            if (insertResult.errors) {
              console.error("Error inserting user:", insertResult.errors);
              throw new Error("Failed to create user profile");
            }
          }
          
          // Successfully logged in and user data is synced
          navigate("/dashboard");
        } catch (dbError) {
          console.error("Database error:", dbError);
          setError("An error occurred while setting up your account. Please try again.");
          await nhost.auth.signOut();
          return;
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
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