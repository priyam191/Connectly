import UserLayout from "@/layout/userLayout";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import styles from "./style.module.css";

// import your redux actions
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { clearMessage } from "@/config/redux/reducer/authReducer";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isLoginMethod, setIsLoginMethod] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  // Clear any existing messages when component mounts
  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  // Clear error when switching between login/register
  useEffect(() => {
    setLocalError("");
  }, [isLoginMethod]);

  // Auto-switch to login after successful registration
  useEffect(() => {
    if (authState.isSuccess && !authState.loggedIn && !isLoginMethod) {
      setIsLoginMethod(true);
      setEmail("");
      setPassword("");
      setUsername("");
      setName("");
    }
  }, [authState.isSuccess, authState.loggedIn, isLoginMethod]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setLocalError("");
    
    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }
    
    if (!email.includes('@')) {
      setLocalError("Please enter a valid email address");
      return;
    }
    
    dispatch(loginUser({ email, password }));
  };

  // Handle Register
  const handleRegister = (e) => {
    e.preventDefault();
    setLocalError("");
    
    if (!name || !username || !email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }
    
    if (!email.includes('@')) {
      setLocalError("Please enter a valid email address");
      return;
    }
    
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }
    
    dispatch(registerUser({ name, username, email, password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          {/* Left Section */}
          <div className={styles.cardContainer_left}>
            <p>{isLoginMethod ? "Welcome Back!" : "Join Us!"}</p>
            <small>
              {isLoginMethod
                ? "Sign in with your credentials"
                : "Create your account to get started"}
            </small>
          </div>

          {/* Right Section */}
          <div className={styles.cardContainer_right}>
            <h2>{isLoginMethod ? "Sign In" : "Sign Up"}</h2>

            <form onSubmit={isLoginMethod ? handleLogin : handleRegister}>
              {/* Error Messages */}
              {(localError || (authState.message && ['login', 'register'].includes(authState.messageType))) && (
                <div style={{
                  padding: '10px',
                  marginBottom: '15px',
                  borderRadius: '5px',
                  backgroundColor: authState.isError ? '#ffebee' : '#e8f5e8',
                  color: authState.isError ? '#c62828' : '#2e7d32',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {localError || authState.message}
                </div>
              )}

              {!isLoginMethod && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={authState.isLoading}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={authState.isLoading}
                    required
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authState.isLoading}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authState.isLoading}
                required
              />

              <button 
                type="submit" 
                disabled={authState.isLoading}
                style={{
                  opacity: authState.isLoading ? 0.7 : 1,
                  cursor: authState.isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {authState.isLoading ? "Loading..." : (isLoginMethod ? "Login" : "Register")}
              </button>
            </form>

            <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
              {isLoginMethod ? (
                <>
                  Don’t have an account?{" "}
                  <span
                    style={{ color: "#2575fc", cursor: "pointer" }}
                    onClick={() => setIsLoginMethod(false)}
                  >
                    Sign Up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    style={{ color: "#2575fc", cursor: "pointer" }}
                    onClick={() => setIsLoginMethod(true)}
                  >
                    Sign In
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;
