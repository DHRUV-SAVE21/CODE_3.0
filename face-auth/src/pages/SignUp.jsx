// src/pages/SignUp.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

// Confetti Component
const Confetti = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  
  const fire = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const particles = [];
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: Math.random() * 5 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 3 + 2,
          wind: (Math.random() - 0.5) * 0.8
        });
      }
      
      let animationId;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.speed;
          p.x += p.wind;
          
          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
          
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        
        animationId = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, []);
  
  React.useImperativeHandle(ref, () => ({
    fire
  }));
  
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <canvas ref={canvasRef} className="confetti-canvas" {...props} />;
});

Confetti.displayName = 'Confetti';

// Text Loop Component
const TextLoop = ({ children, interval = 2, stopOnEnd = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = React.Children.toArray(children);
  
  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex(current => {
        if (stopOnEnd && current === items.length - 1) {
          clearInterval(timer);
          return current;
        }
        return (current + 1) % items.length;
      });
    }, intervalMs);
    
    return () => clearInterval(timer);
  }, [items.length, interval, stopOnEnd]);
  
  return (
    <div className="text-loop">
      <div className="text-loop-item">
        {items[currentIndex]}
      </div>
    </div>
  );
};

// Blur Fade Component
const BlurFade = ({ children, delay = 0, className = '' }) => {
  return (
    <div 
      className={`blur-fade ${className}`}
      style={{
        animationDelay: `${delay}s`
      }}
    >
      {children}
    </div>
  );
};

// Glass Button Component
const GlassButton = React.forwardRef(({ 
  children, 
  onClick, 
  size = 'default',
  className = '',
  type = 'button',
  disabled = false,
  ...props 
}, ref) => {
  return (
    <div className="glass-button-wrap">
      <button
        ref={ref}
        type={type}
        className={`glass-button glass-button-${size} ${className} ${disabled ? 'disabled' : ''}`}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        <span className="glass-button-text">
          {children}
        </span>
      </button>
      <div className="glass-button-shadow"></div>
    </div>
  );
});

GlassButton.displayName = 'GlassButton';

// Camera Window Component
const CameraWindow = ({ onClose, onSuccess }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('initializing');
  
  useEffect(() => {
    let stream = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('streaming');
          
          setTimeout(() => {
            setStatus('scanning');
            setTimeout(() => {
              setStatus('complete');
              setTimeout(onSuccess, 800);
            }, 3000);
          }, 1000);
        }
      } catch (err) {
        console.error('Camera error:', err);
        alert('Camera access is required for face verification. Please allow camera access.');
        onClose();
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose, onSuccess]);
  
  const statusMessages = {
    initializing: 'Starting Camera...',
    streaming: 'Align Your Face',
    scanning: 'Verifying Identity...',
    complete: 'Identity Verified!'
  };
  
  return (
    <div className="camera-window-overlay">
      <div className="camera-window">
        <div className="camera-preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />
          
          {status === 'scanning' && (
            <div className="scanning-overlay">
              <div className="scanning-line"></div>
            </div>
          )}
          
          <div className="face-guide-frame">
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>
          </div>
        </div>
        
        <div className="camera-controls">
          <h3>{statusMessages[status]}</h3>
          <p>Please look directly at the camera while we verify your identity.</p>
        </div>
        
        <button className="camera-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

// Modal Steps
const modalSteps = [
  {
    message: "Signing you up...",
    icon: "⏳"
  },
  {
    message: "Onboarding you...",
    icon: "🔄"
  },
  {
    message: "Finalizing...",
    icon: "⚡"
  },
  {
    message: "Welcome Aboard!",
    icon: "🎉"
  }
];

// Main SignUp Component
const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState('email');
  const [modalStatus, setModalStatus] = useState('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [showCameraWindow, setShowCameraWindow] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  
  const confettiRef = useRef(null);
  const fileInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  
  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.length >= 6;
  
  useEffect(() => {
    if (authStep === 'password') {
      setTimeout(() => passwordInputRef.current?.focus(), 500);
    } else if (authStep === 'confirmPassword') {
      setTimeout(() => confirmPasswordInputRef.current?.focus(), 500);
    }
  }, [authStep]);
  
  const handleProgressStep = () => {
    if (authStep === 'email' && isEmailValid) {
      setAuthStep('password');
    } else if (authStep === 'password' && isPasswordValid) {
      setAuthStep('confirmPassword');
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProgressStep();
    }
  };
  
  const handleGoBack = () => {
    if (authStep === 'confirmPassword') {
      setAuthStep('password');
      setConfirmPassword('');
    } else if (authStep === 'password') {
      setAuthStep('email');
    } else if (authStep === 'faceRecognition') {
      setAuthStep('confirmPassword');
    }
  };
  
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (modalStatus !== 'closed') return;
    
    if (authStep === 'confirmPassword') {
      if (password !== confirmPassword) {
        setModalErrorMessage('Passwords do not match!');
        setModalStatus('error');
      } else {
        // Skip face auth and go to layout
        const dummyAccount = {
          id: 'user_' + Date.now(),
          email: email,
          name: email.split('@')[0],
          type: 'custom'
        };
        localStorage.setItem('faceAuth', JSON.stringify({ account: dummyAccount }));
        navigate('/user-select');
      }
    }
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const startCamera = () => {
    setShowCameraWindow(true);
  };
  
  const handleCameraSuccess = () => {
    setShowCameraWindow(false);
    performFaceScan();
  };
  
  const performFaceScan = () => {
    setModalStatus('loading');
    
    setTimeout(() => {
      if (confettiRef.current?.fire) {
        confettiRef.current.fire();
      }
      setModalStatus('success');
      
      setTimeout(() => {
        setModalStatus('closed');
        // Redirect to home after successful signup
        window.location.href = '/';
      }, 3000);
    }, 4500);
  };
  
  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };
  
  const Modal = () => {
    if (modalStatus === 'closed') return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal">
          {modalStatus === 'error' && (
            <>
              <button className="modal-close" onClick={closeModal}>✕</button>
              <div className="modal-icon error">⚠️</div>
              <p className="modal-message">{modalErrorMessage}</p>
              <GlassButton onClick={closeModal} size="sm">
                Try Again
              </GlassButton>
            </>
          )}
          
          {modalStatus === 'loading' && (
            <TextLoop interval={1.5} stopOnEnd={true}>
              {modalSteps.slice(0, -1).map((step, i) => (
                <div key={i} className="modal-step">
                  <div className="modal-icon">{step.icon}</div>
                  <p className="modal-message">{step.message}</p>
                </div>
              ))}
            </TextLoop>
          )}
          
          {modalStatus === 'success' && (
            <div className="modal-step">
              <button className="modal-close" onClick={closeModal}>✕</button>
              <div className="modal-icon success">🎉</div>
              <p className="modal-message">{modalSteps[3].message}</p>
              <GlassButton onClick={closeModal} size="sm">
                Continue
              </GlassButton>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="signup-page">
      <Confetti ref={confettiRef} className="confetti-canvas" />
      <Modal />
      
      {showCameraWindow && (
        <CameraWindow
          onClose={() => setShowCameraWindow(false)}
          onSuccess={handleCameraSuccess}
        />
      )}
      
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            {authStep === 'email' && (
              <BlurFade delay={0.25}>
                <h1>Get started with Us</h1>
              </BlurFade>
            )}
            
            {authStep === 'password' && (
              <>
                <BlurFade delay={0}>
                  <h1>Create your password</h1>
                </BlurFade>
                <BlurFade delay={0.25}>
                  <p className="subtitle">Your password must be at least 6 characters long.</p>
                </BlurFade>
              </>
            )}
            
            {authStep === 'confirmPassword' && (
              <BlurFade delay={0.25}>
                <p className="subtitle">Confirm your password to continue</p>
              </BlurFade>
            )}
            
            {authStep === 'faceRecognition' && (
              <>
                <BlurFade delay={0}>
                  <div className="face-icon">👤</div>
                </BlurFade>
                <BlurFade delay={0.25}>
                  <h1>Face Verification</h1>
                </BlurFade>
                <BlurFade delay={0.5}>
                  <p className="subtitle">Please verify your identity to complete sign up.</p>
                </BlurFade>
              </>
            )}
          </div>
          
          <form onSubmit={handleFinalSubmit} className="signup-form">
            {authStep !== 'confirmPassword' && authStep !== 'faceRecognition' && (
              <div className="form-fields">
                <BlurFade delay={authStep === 'email' ? 1.25 : 0}>
                  <div className="input-wrapper">
                    {authStep === 'password' && (
                      <label className="input-label">Email</label>
                    )}
                    <div className="glass-input-wrap">
                      <div className="glass-input">
                        <span className="input-icon">✉️</span>
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className={`email-input ${isEmailValid && authStep === 'email' ? 'has-action' : ''}`}
                          required
                        />
                        {isEmailValid && authStep === 'email' && (
                          <GlassButton
                            type="button"
                            onClick={handleProgressStep}
                            size="icon"
                            className="input-action-btn"
                          >
                            →
                          </GlassButton>
                        )}
                      </div>
                    </div>
                  </div>
                </BlurFade>
                
                {authStep === 'password' && (
                  <BlurFade key="password-field">
                    <div className="input-wrapper">
                      {password.length > 0 && (
                        <label className="input-label">Password</label>
                      )}
                      <div className="glass-input-wrap">
                        <div className="glass-input">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="input-icon password-toggle"
                          >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                          </button>
                          <input
                            ref={passwordInputRef}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="password-input"
                            required
                            minLength="6"
                          />
                          {isPasswordValid && (
                            <GlassButton
                              type="button"
                              onClick={handleProgressStep}
                              size="icon"
                              className="input-action-btn"
                            >
                              →
                            </GlassButton>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleGoBack}
                        className="back-btn"
                      >
                        ← Go back
                      </button>
                    </div>
                  </BlurFade>
                )}
              </div>
            )}
            
            {authStep === 'confirmPassword' && (
              <BlurFade key="confirm-password-field">
                <div className="input-wrapper">
                  {confirmPassword.length > 0 && (
                    <label className="input-label">Confirm Password</label>
                  )}
                  <div className="glass-input-wrap">
                    <div className="glass-input">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="input-icon password-toggle"
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <input
                        ref={confirmPasswordInputRef}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="password-input"
                        required
                        minLength="6"
                      />
                      {isConfirmPasswordValid && (
                        <GlassButton
                          type="submit"
                          size="icon"
                          className="input-action-btn"
                        >
                          →
                        </GlassButton>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="back-btn"
                  >
                    ← Go back
                  </button>
                </div>
              </BlurFade>
            )}
            
            {authStep === 'faceRecognition' && (
              <BlurFade key="face-rec-action">
                <div className="face-verification">
                  <div className="face-preview">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Face Preview" />
                    ) : (
                      <div className="face-placeholder">👤</div>
                    )}
                    <div className="face-preview-overlay">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📁 Upload Photo
                      </button>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden-file-input"
                  />
                  
                  <div className="verification-buttons">
                    <GlassButton
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                    >
                      📁 Upload Image
                    </GlassButton>
                    <GlassButton
                      type="button"
                      onClick={startCamera}
                      size="lg"
                    >
                      Verify Identity
                    </GlassButton>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="back-btn"
                  >
                    ← Go back
                  </button>
                </div>
              </BlurFade>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;