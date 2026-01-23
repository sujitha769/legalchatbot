import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FIRDrafter from './FIRDrafter';
import FIRPreview from './FIRPreview';

const FIRDrafterPage = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [generatedFIR, setGeneratedFIR] = useState('');

  const handleClose = () => {
    navigate('/chat');
  };

  const handleGenerate = async (firDocument, formData) => {
    setGeneratedFIR(firDocument);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    navigate('/chat');
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  return (
    <div className="fir-page-container">
      {!showPreview ? (
        <FIRDrafter 
          onClose={handleClose}
          onGenerate={handleGenerate}
        />
      ) : (
        <FIRPreview 
          firDocument={generatedFIR}
          onClose={handleClosePreview}
          onEdit={handleEdit}
        />
      )}

      <style jsx>{`
        .fir-page-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background:gray;
          padding: 20px;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default FIRDrafterPage;