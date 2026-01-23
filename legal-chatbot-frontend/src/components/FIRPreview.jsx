import { useState } from 'react';

const FIRPreview = ({ firDocument, onClose, onEdit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(firDocument);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([firDocument], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FIR_Draft_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>FIR Draft</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 40px;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <pre>${firDocument}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fir-preview-overlay">
      <div className="fir-preview-modal">
        <div className="preview-header">
          <h2>📄 FIR Draft Preview</h2>
          <div className="header-actions">
            <button className="toolbar-btn print-btn" onClick={handlePrint}>
              🖨️ Print
            </button>
            {onEdit && (
              <button className="toolbar-btn edit-btn" onClick={onEdit}>
                ✏️ Edit
              </button>
            )}
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="preview-body">
          <pre className="fir-content">{firDocument}</pre>
        </div>

        <div className="preview-footer">
          <button className="btn-close" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>

      <style jsx>{`
        .fir-preview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          padding: 20px;
        }

        .fir-preview-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
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

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 2px solid #e0e0e0;
        }

        .preview-header h2 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toolbar-btn {
          padding: 10px 20px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .toolbar-btn.print-btn {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }

        .toolbar-btn.print-btn:hover {
          background: #7c3aed;
          border-color: #7c3aed;
          transform: translateY(-1px);
        }

        .toolbar-btn.edit-btn {
          background: #ffa502;
          color: white;
          border-color: #ffa502;
        }

        .toolbar-btn.edit-btn:hover {
          background: #ff8800;
          border-color: #ff8800;
          transform: translateY(-1px);
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

        .preview-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #fafafa;
        }

        .fir-content {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          background: white;
          padding: 30px;
          border-radius: 8px;
          white-space: pre-wrap;
          word-wrap: break-word;
          border: 2px solid #e0e0e0;
          color: #333;
        }

        .preview-footer {
          padding: 24px;
          border-top: 2px solid #e0e0e0;
          display: flex;
          justify-content: center;
        }

        .btn-close {
          padding: 12px 32px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #5568d3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .header-actions {
            gap: 8px;
          }

          .toolbar-btn {
            font-size: 12px;
            padding: 8px 14px;
          }

          .fir-content {
            font-size: 11px;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default FIRPreview;