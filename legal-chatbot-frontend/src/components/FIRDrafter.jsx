import { useState } from 'react';

const FIRDrafter = ({ onClose, onGenerate }) => {
  const [formData, setFormData] = useState({
    // Complainant Details
    complainantName: '',
    complainantAge: '',
    complainantGender: 'Male',
    complainantAddress: '',
    complainantPhone: '',
    complainantOccupation: '',
    
    // Incident Details
    incidentDate: '',
    incidentTime: '',
    incidentPlace: '',
    incidentDescription: '',
    
    // Accused Details
    accusedName: '',
    accusedAge: '',
    accusedAddress: '',
    accusedDescription: '',
    
    // Crime Details
    crimeType: '',
    sections: '',
    witnesses: '',
    evidence: '',
    
    // Police Station
    policeStation: '',
    district: '',
    state: ''
  });

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Format the FIR document
    const firDocument = generateFIRDocument(formData);
    
    // Call the parent callback with generated FIR
    if (onGenerate) {
      await onGenerate(firDocument, formData);
    }
    
    setIsGenerating(false);
  };

  const generateFIRDocument = (data) => {
    const currentDate = new Date().toLocaleDateString('en-IN');
    
    return `
FIRST INFORMATION REPORT
(Under Section 154 Cr.P.C.)

Police Station: ${data.policeStation || '_____________'}
District: ${data.district || '_____________'}
State: ${data.state || '_____________'}
Date of FIR: ${currentDate}

═══════════════════════════════════════════════════════════════

1. COMPLAINANT DETAILS

Name: ${data.complainantName || '_____________'}
Age: ${data.complainantAge || '___'} years
Gender: ${data.complainantGender}
Occupation: ${data.complainantOccupation || '_____________'}
Address: ${data.complainantAddress || '_____________'}
Contact Number: ${data.complainantPhone || '_____________'}

═══════════════════════════════════════════════════════════════

2. INCIDENT DETAILS

Date of Incident: ${data.incidentDate || '_____________'}
Time of Incident: ${data.incidentTime || '_____________'}
Place of Incident: ${data.incidentPlace || '_____________'}

Description of Incident:
${data.incidentDescription || 'Details of the incident...'}

═══════════════════════════════════════════════════════════════

3. ACCUSED/SUSPECT DETAILS

Name (if known): ${data.accusedName || 'Unknown'}
Age (approx.): ${data.accusedAge || 'Unknown'}
Address (if known): ${data.accusedAddress || 'Unknown'}
Description: ${data.accusedDescription || 'Description of accused...'}

═══════════════════════════════════════════════════════════════

4. NATURE OF OFFENSE

Type of Crime: ${data.crimeType || '_____________'}
Applicable Sections of Law: ${data.sections || '_____________'}

═══════════════════════════════════════════════════════════════

5. WITNESSES (if any)

${data.witnesses || 'No witnesses mentioned'}

═══════════════════════════════════════════════════════════════

6. EVIDENCE/PROPERTY INVOLVED

${data.evidence || 'No evidence/property mentioned'}

═══════════════════════════════════════════════════════════════

DECLARATION

I, ${data.complainantName || '__________'}, hereby declare that the above information is true to the best of my knowledge and belief.


Signature of Complainant: _____________
Date: ${currentDate}


For Official Use Only:
FIR Number: _____________
Date & Time of Registration: _____________
Signature of Recording Officer: _____________
Rank & Name: _____________
    `.trim();
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="form-section">
            <h3>👤 Complainant Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="complainantName"
                  value={formData.complainantName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  name="complainantAge"
                  value={formData.complainantAge}
                  onChange={handleChange}
                  placeholder="Age"
                  min="18"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="complainantGender"
                  value={formData.complainantGender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  name="complainantOccupation"
                  value={formData.complainantOccupation}
                  onChange={handleChange}
                  placeholder="Your occupation"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Address *</label>
                <textarea
                  name="complainantAddress"
                  value={formData.complainantAddress}
                  onChange={handleChange}
                  placeholder="Complete address with PIN code"
                  rows="2"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="complainantPhone"
                  value={formData.complainantPhone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="form-section">
            <h3>📅 Incident Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Date of Incident *</label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Time of Incident *</label>
                <input
                  type="time"
                  name="incidentTime"
                  value={formData.incidentTime}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Place of Incident *</label>
                <input
                  type="text"
                  name="incidentPlace"
                  value={formData.incidentPlace}
                  onChange={handleChange}
                  placeholder="Exact location where incident occurred"
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Description of Incident *</label>
                <textarea
                  name="incidentDescription"
                  value={formData.incidentDescription}
                  onChange={handleChange}
                  placeholder="Describe what happened in detail. Include sequence of events, any conversations, and all relevant facts..."
                  rows="6"
                  required
                />
                <small>Be as detailed as possible. Include all facts chronologically.</small>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="form-section">
            <h3>👥 Accused & Crime Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Accused Name</label>
                <input
                  type="text"
                  name="accusedName"
                  value={formData.accusedName}
                  onChange={handleChange}
                  placeholder="If known, otherwise write 'Unknown'"
                />
              </div>
              
              <div className="form-group">
                <label>Accused Age (approx.)</label>
                <input
                  type="text"
                  name="accusedAge"
                  value={formData.accusedAge}
                  onChange={handleChange}
                  placeholder="Approximate age if known"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Accused Address</label>
                <input
                  type="text"
                  name="accusedAddress"
                  value={formData.accusedAddress}
                  onChange={handleChange}
                  placeholder="If known"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Physical Description of Accused</label>
                <textarea
                  name="accusedDescription"
                  value={formData.accusedDescription}
                  onChange={handleChange}
                  placeholder="Height, build, complexion, identifying marks, clothing, etc."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Type of Crime *</label>
                <select
                  name="crimeType"
                  value={formData.crimeType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select crime type</option>
                  <option value="Theft">Theft</option>
                  <option value="Robbery">Robbery</option>
                  <option value="Assault">Assault</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Cyber Crime">Cyber Crime</option>
                  <option value="Kidnapping">Kidnapping</option>
                  <option value="Murder">Murder</option>
                  <option value="Rape">Rape</option>
                  <option value="Domestic Violence">Domestic Violence</option>
                  <option value="Cheating">Cheating</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Applicable BNS Sections</label>
                <input
                  type="text"
                  name="sections"
                  value={formData.sections}
                  onChange={handleChange}
                  placeholder="e.g., 379 BNS, 420 BNS"
                />
                <small>Leave blank if unsure. Police will determine.</small>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="form-section">
            <h3>📝 Additional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Police Station *</label>
                <input
                  type="text"
                  name="policeStation"
                  value={formData.policeStation}
                  onChange={handleChange}
                  placeholder="Name of police station"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>District *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="District name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State name"
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Witnesses (if any)</label>
                <textarea
                  name="witnesses"
                  value={formData.witnesses}
                  onChange={handleChange}
                  placeholder="List names, addresses, and contact details of witnesses"
                  rows="3"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Evidence/Property Details</label>
                <textarea
                  name="evidence"
                  value={formData.evidence}
                  onChange={handleChange}
                  placeholder="List any stolen property, weapons, documents, or other evidence"
                  rows="3"
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fir-drafter-overlay">
      <div className="fir-drafter-modal">
        <div className="modal-header">
          <h2>📄 FIR Drafter</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="progress-bar">
          {[1, 2, 3, 4].map(num => (
            <div 
              key={num} 
              className={`progress-step ${step >= num ? 'active' : ''}`}
            >
              <div className="step-number">{num}</div>
              <div className="step-label">
                {num === 1 ? 'Complainant' : 
                 num === 2 ? 'Incident' : 
                 num === 3 ? 'Accused' : 
                 'Details'}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {renderStep()}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={handlePrevious}
            disabled={step === 1}
          >
            ← Previous
          </button>
          
          {step < 4 ? (
            <button className="btn-primary" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button 
              className="btn-generate" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : '📄 Generate FIR'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        // In FIRDrafter.jsx, change this style:
.fir-drafter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white; /* Changed from rgba(0, 0, 0, 0.7) */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

        .fir-drafter-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 2px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #666;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f5f5f5;
          color: #333;
        }

        .progress-bar {
          display: flex;
          justify-content: space-between;
          padding: 24px;
          background: #f8f9fa;
        }

        .progress-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .progress-step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 18px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: #ddd;
          z-index: 0;
        }

        .progress-step.active:not(:last-child)::after {
          background: #667eea;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ddd;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          z-index: 1;
          transition: all 0.3s;
        }

        .progress-step.active .step-number {
          background: #667eea;
          color: white;
          transform: scale(1.1);
        }

        .step-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .progress-step.active .step-label {
          color: #667eea;
          font-weight: 600;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .form-section h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group small {
          font-size: 12px;
          color: #666;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          padding: 24px;
          border-top: 2px solid #e0e0e0;
          gap: 12px;
        }

        .btn-secondary,
        .btn-primary,
        .btn-generate {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #333;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-generate {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-generate:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-generate:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .progress-bar {
            padding: 16px;
          }

          .step-label {
            font-size: 10px;
          }

          .step-number {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default FIRDrafter;