import { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        // ✅ store userId for later use
        localStorage.setItem("userId", data.userId);
        

        setMessage("Login successful");
        onLoginSuccess(); // navigate to dashboard
      }
      
    } catch  {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="login_page">
      <div className="login-container">
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <p className="login-message">{message}</p>
      </div>
    </div>
  );
}

export default Login;
