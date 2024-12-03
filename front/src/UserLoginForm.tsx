import React, { useState } from 'react';

interface UserLoginFormProps {
  onLoginSuccess: () => void; // Callback function for successful login
}

const UserLoginForm: React.FC<UserLoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [responseMessage, setResponseMessage] = useState<string>('');

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.Token;

        // Store the JWT token in localStorage
        localStorage.setItem('authToken', token);

        // Call the onLoginSuccess prop to update the App component
        onLoginSuccess();
      } else {
        const error = await response.json();
        setResponseMessage(error?.message || 'Error logging in.');
      }
    } catch (error) {
      setResponseMessage('Failed to connect to the server.');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Login</button>

      {responseMessage && <p>{responseMessage}</p>}
    </form>
  );
};

export default UserLoginForm;
