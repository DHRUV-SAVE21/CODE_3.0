import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css'; // Reusing existing styles for consistency

const SignInEmail = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      // Navigate to user select, passing email in state if needed future-wise
      navigate('/user-select', { state: { email } });
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h1>Welcome Back</h1>
            <p className="subtitle">Enter your email to sign in</p>
          </div>
          
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-fields">
              <div className="input-wrapper">
                <label className="input-label">Email</label>
                <div className="glass-input-wrap">
                  <div className="glass-input">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="email-input"
                      required
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="w-full rounded-full bg-black/90 py-4 text-xl font-bold text-white shadow-lg hover:bg-black hover:scale-[1.02] transition-all duration-300 border border-white/10 backdrop-blur-sm"
                >
                  Continue →
                </button>
              </div>
            </div>
            
            <button
                type="button"
                onClick={() => navigate('/')}
                className="back-btn mx-auto"
            >
                ← Go back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInEmail;
