// export function NavBar({ onStart }) {
//   const handleNavClick = (e, section) => {
//     e.preventDefault();
//     console.log(`Navigating to ${section}`);
//     // Add smooth scroll or routing logic here
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300">
//       <div className="flex items-center gap-2">
//         <span className="text-3xl font-bold tracking-tight text-black">ThinkStep</span>
//       </div>

//       <div className="hidden md:flex items-center gap-10">
//         <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="text-3xl font-medium text-black/70 hover:text-black transition-colors">Home</a>
//         <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-3xl font-medium text-black/70 hover:text-black transition-colors">Features</a>
//         <a href="#solutions" onClick={(e) => handleNavClick(e, 'solutions')} className="text-3xl font-medium text-black/70 hover:text-black transition-colors">Solutions</a>
//         <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-3xl font-medium text-black/70 hover:text-black transition-colors">Pricing</a>
//         <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="text-3xl font-medium text-black/70 hover:text-black transition-colors">About</a>
//       </div>

//       <div className="flex items-center gap-6">
//         <button 
//           className="text-3xl font-medium text-black/70 hover:text-black transition-colors hidden sm:block"
//           onClick={() => console.log('Sign In clicked')}
//         >
//           Sign In
//         </button>
//         <button 
//           onClick={onStart}
//           className="px-8 py-3 text-2xl font-medium text-black/70 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white/40 transition-all duration-300"
//         >
//           Get Started
//         </button>
//       </div>
//     </nav>
//   );
// }


// src/pages/NavBar.jsx
import { useNavigate, useLocation } from 'react-router-dom';

export function NavBar({ onStart }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, section) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${section}`);
    }
  };

  const handleGetStarted = () => {
    // Navigate to signup page when clicked
    navigate('/signup');
    
    // If you also want to call the onStart prop (optional)
    if (onStart) {
      onStart();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300">
       <div className="flex items-center gap-2">
      <span className="text-3xl font-bold tracking-tight text-black">ThinkStep</span>
       </div>

      <div className="hidden md:flex items-center gap-10">
        <button onClick={(e) => handleNavClick(e, 'home')} className="text-3xl font-medium text-black/70 hover:text-black transition-colors bg-transparent border-0 cursor-pointer">Home</button>
        <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-3xl font-medium text-black/70 hover:text-black transition-colors">Features</a>
     
        <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-3xl font-medium text-black/70 hover:text-black transition-colors">Pricing</a>
       
     </div>
      
      <div className="flex items-center gap-6">
        <button 
          className="text-3xl font-medium text-black/70 hover:text-black transition-colors hidden sm:block"
          onClick={() => navigate('/signin')}
        >
          Sign In
        </button>
        <button 
          onClick={handleGetStarted} // This will now navigate to /signup
          className="px-8 py-3 text-2xl font-medium text-black/70 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white/40 transition-all duration-300"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}