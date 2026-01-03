// import { RouterProvider } from "react-router-dom";
// import router from "./router";
// import { HeroSection } from './pages/HeroSection';
// import { NavBar } from './pages/NavBar';

// function App() {
//    const handleGetStarted = () => {
//     console.log('Get Started clicked!');
//     // Add your logic here
//   };
//   return (
//     <>
//       <HeroSection />
//        <NavBar onStart={handleGetStarted} />
//       <RouterProvider router={router} />
//     </>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import { HeroSection } from './pages/HeroSection';
import { NavBar } from './pages/NavBar';
import FeaturesSection from './pages/FeaturesSection';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import SignInEmail from './pages/SignInEmail';
import UserSelect from './pages/UserSelect';
import Protected from './pages/Protected';

// Layout Component
const Layout = ({ children, showHero = false, showFeatures = false, showNavBar = true }) => {
  return (
    <div className="app-layout min-h-screen flex flex-col">
      {showNavBar && <NavBar />}
      {showHero && <HeroSection />}
      <main className="main-content flex-grow flex items-center justify-center relative z-10">
        {children}
      </main>
      {showFeatures && <FeaturesSection />}
    </div>
  );
};

// Scroll to Hash Component
const ScrollToHash = () => {
  const location = useLocation();
  
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return null;
};

function App() {
  const handleGetStarted = () => {
    console.log('Get Started clicked!');
  };
  
  return (
    <Router>
      <ScrollToHash />
      <Routes>
        {/* Home page with Hero + Features */}
        <Route path="/" element={
          <Layout showHero={true} showFeatures={true}>
            {/* Main content can be empty or have additional content */}
            <div className="home-content">
              {/* Additional home page content if needed */}
            </div>
          </Layout>
        } />
        
        {/* Other pages without Hero/Features */}
        <Route path="/user-select" element={
          <Layout>
            <HeroSection>
              <UserSelect />
            </HeroSection>
          </Layout>
        } />
        
        <Route path="/login" element={
          <Layout>
            <HeroSection>
              <Login />
            </HeroSection>
          </Layout>
        } />
        
        <Route path="/signup" element={
          <Layout>
            <HeroSection>
              <SignUp />
            </HeroSection>
          </Layout>
        } />
        
        <Route path="/signin" element={
          <Layout>
            <HeroSection>
              <SignInEmail />
            </HeroSection>
          </Layout>
        } />
        
        <Route path="/protected" element={
          <Layout showNavBar={false}>
            <HeroSection>
              <Protected />
            </HeroSection>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;