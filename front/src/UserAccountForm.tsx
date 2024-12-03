import React, { useState } from 'react';

// Define the types for the form data
interface FormData {
    name: string;
    email: string;
    password: string;
}

const UserAccountForm = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',    
        email: '',
        password: '',
    });

    const [responseMessage, setResponseMessage] = useState('');

    // Handle form input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/users/novouser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                setResponseMessage('Account created successfully!');
            } else {
                const error = await response.json(); // Read error message from server response
                setResponseMessage(error?.message || 'Error creating account.');
            }
        } catch (error) {
            setResponseMessage('Failed to connect to server.');
            console.error(error); // Log error for debugging
        }
    };

    return (
        <div className="user-account-form">
            <h3>Crie sua conta de usuário</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button type="submit">Create Account</button>
            </form>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};

export default UserAccountForm;
