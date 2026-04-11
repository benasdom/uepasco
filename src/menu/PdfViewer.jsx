import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
// CSS styles to support "all at once" scrolling
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

export default function PdfViewer({ url, setIframeLoaded }) {
  const [numPages, setNumPages] = useState(null);
  const [togpdf, settogpdf] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    // Short timeout ensures the first few pages have started rendering
    setTimeout(() => setIframeLoaded(true), 1000);
  }
const handleRemount=()=>{
  settogpdf(false)
  setTimeout(() => settogpdf(true), 100);
}

  return (
    <div className="pdf-container" style={{ width: '100%', height: '100vh', overflowY: 'auto', background: '#160d1f' }}>
     {togpdf && <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="" style={{margin:"auto"}}><div className="nbtn refloader" style={{width:"fit-content",margin:"auto",padding:10}}>...Loading</div></div>}
        error={<div className="nbtn" onLoad={handleRemount}>Failed to load PDF. Please try again.</div>}
      >
        {/* This loop renders all pages in a vertical stack "at a go" */}
        {Array.from(new Array(numPages), (el, index) => (
          <div key={`page_container_${index + 1}`} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
            <Page
              pageNumber={index + 1}
              // Automatically fits to the width of the screen
              width={window.innerWidth > 800 ? 800 : window.innerWidth - 20}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </div>
        ))}
      </Document>}
    </div>
  );
}