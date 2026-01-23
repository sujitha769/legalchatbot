import { useNavigate } from 'react-router-dom';
import '../LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/chat');
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Logo/Image Section */}
        <div className="logo-section">
          <div className="logo-circle">
            <img src="/nya.png" alt="Legal Crime Assistant" />
          </div>
        </div>

        {/* Content Section */}
        <div className="content-section">
          <h1 className="landing-title">Legal Crime Assistant</h1>
          <p className="landing-subtitle">
            Your AI-Powered Legal Guide for Indian Law
          </p>
          

           <p>
           An AI-powered legal assistance platform designed to help users understand, navigate, and apply Indian law with accuracy and clarity. The system provides structured guidance across legal provisions, enabling informed decision-making and reducing errors caused by outdated or incorrect legal references.  
          </p>
        

      
           
            <p className="disclaimer">
              <strong>Note:</strong> This tool is for informational purposes only and does not constitute 
              legal advice. Please consult a qualified lawyer for legal matters.
            </p>
       

          <button className="get-started-btn" onClick={handleGetStarted}>
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;