import React, { useRef, useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  PrinterIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PDFGenerator.css';

interface PDFGeneratorProps {
  title?: string;
  children: React.ReactNode;
  filename?: string;
  className?: string;
  showPreview?: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  title = 'Document',
  children,
  filename = 'document',
  className = '',
  showPreview = false,
  orientation = 'portrait',
  pageSize = 'a4',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF(orientation, 'mm', pageSize);
      
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const printDocument = async () => {
    if (!contentRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { margin: 0; padding: 20px; }
                img { width: 100%; height: auto; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <img src="${imgData}" alt="${title}" />
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error printing document:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openPreview = () => {
    setShowPreviewModal(true);
  };

  return (
    <div className={`pdf-generator ${className}`}>
      <div className="pdf-controls">
        {showPreview && (
          <button
            className="preview-btn"
            onClick={openPreview}
            title="Preview document"
          >
            <EyeIcon className="w-4 h-4" />
            <span>Preview</span>
          </button>
        )}
        
        <button
          className="print-btn"
          onClick={printDocument}
          disabled={isGenerating}
          title="Print document"
        >
          <PrinterIcon className="w-4 h-4" />
          <span>{isGenerating ? 'Printing...' : 'Print'}</span>
        </button>
        
        <button
          className="download-btn"
          onClick={generatePDF}
          disabled={isGenerating}
          title="Download PDF"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>

      <div 
        ref={contentRef}
        className="pdf-content"
        style={{
          width: orientation === 'portrait' ? '210mm' : '297mm',
          minHeight: orientation === 'portrait' ? '297mm' : '210mm',
          padding: '20mm',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          margin: '20px auto',
        }}
      >
        <div className="pdf-header">
          <h1 className="pdf-title">{title}</h1>
          <div className="pdf-meta">
            <span>Generated on: {new Date().toLocaleDateString()}</span>
            <span>Page: {pageSize.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="pdf-body">
          {children}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="preview-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>Document Preview</h3>
              <button
                className="close-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="preview-content">
              <div 
                className="preview-document"
                style={{
                  width: orientation === 'portrait' ? '210mm' : '297mm',
                  minHeight: orientation === 'portrait' ? '297mm' : '210mm',
                  padding: '20mm',
                  backgroundColor: 'white',
                  transform: 'scale(0.5)',
                  transformOrigin: 'top left',
                }}
              >
                <div className="pdf-header">
                  <h1 className="pdf-title">{title}</h1>
                  <div className="pdf-meta">
                    <span>Generated on: {new Date().toLocaleDateString()}</span>
                    <span>Page: {pageSize.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="pdf-body">
                  {children}
                </div>
              </div>
            </div>
            
            <div className="preview-footer">
              <button
                className="print-btn"
                onClick={printDocument}
                disabled={isGenerating}
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
              
              <button
                className="download-btn"
                onClick={generatePDF}
                disabled={isGenerating}
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Utility component for creating PDF reports
export const PDFReport: React.FC<{
  title: string;
  data: any[];
  columns: { key: string; label: string; width?: string }[];
  filename?: string;
}> = ({ title, data, columns, filename }) => {
  return (
    <PDFGenerator title={title} filename={filename || title.toLowerCase().replace(/\s+/g, '-')}>
      <div className="pdf-report">
        <table className="pdf-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={{ width: column.width }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PDFGenerator>
  );
};
