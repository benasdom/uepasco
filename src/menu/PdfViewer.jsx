import { useState, useEffect } from "react";

export default function PdfViewer({ url, setIframeLoaded }) {
  const [isMobile, setIsMobile] = useState(false);
  const fullUrl = `${url}`;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    setIsMobile(mediaQuery.matches);

    // 3. Listen for screen size changes
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // 4. Use if/else logic to return different iframes
  if (isMobile) {
    return (
      <iframe
        className="loadpdf"
        src={`https://docs.google.com/viewer?url=${fullUrl}`}
        title="Mobile View"
        style={{ width: "100%", height: "100vh", border: "none" }}
onLoad={() => setTimeout(() => setIframeLoaded(true), 4000)}

      />
    );
  } else {
    return (
      <iframe
        className="loadpdf"
        src={fullUrl}
        title="Laptop View"
        style={{ width: "100%", height: "100vh", border: "none" }}
onLoad={() => setTimeout(() => setIframeLoaded(true), 4000)}

      />
    );
  }
}


// import { useEffect, useRef, useState } from "react";
// import * as pdfjsLib from "pdfjs-dist";

// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.mjs",
//   import.meta.url
// ).href;

// // Helper component for each individual page
// function PdfPage({ pdfDoc, pageNumber }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     let renderTask = null;

//     const render = async () => {
//       try {
//         const page = await pdfDoc.getPage(pageNumber);
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");

//         // Calculate scale to fit 100% width of the parent container
//         const containerWidth = canvas.parentElement.clientWidth;
//         const unscaledViewport = page.getViewport({ scale: 1 });
//         const scale = containerWidth / unscaledViewport.width;
//         const viewport = page.getViewport({ scale });

//         canvas.height = viewport.height;
//         canvas.width = viewport.width;

//         renderTask = page.render({ canvasContext: ctx, viewport });
//         await renderTask.promise;
//       } catch (err) {
//         if (err.name !== "RenderingCancelledException") console.error(err);
//       }
//     };

//     render();
//     return () => renderTask?.cancel();
//   }, [pdfDoc, pageNumber]);

//   return <canvas ref={canvasRef} style={{ display: "block", marginBottom: "10px", width: "100%" }} />;
// }

// export default function SmoothPdfViewer({ url }) {
//   const [pdfDoc, setPdfDoc] = useState(null);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (!url) return;
//     const loadingTask = pdfjsLib.getDocument(url);
//     loadingTask.promise.then(setPdfDoc).catch(console.error);
//     return () => loadingTask.destroy();
//   }, [url]);

//   if (!pdfDoc) return <div style={{ padding: "20px" }}>Loading PDF...</div>;

//   return (
//     <div 
//       ref={containerRef} 
//       style={{ 
//         overflowY: "auto", 
//         backgroundColor: "#525659", // Classic PDF viewer dark background
//         padding: "20px 0" 
//       }}
//       className="loadpdf"
//     >
//       <div style={{ maxWidth: "900px", margin: "0 auto", width: "60%" }}>
//         {Array.from({ length: pdfDoc.numPages }, (_, i) => (
//           <PdfPage key={i + 1} pdfDoc={pdfDoc} pageNumber={i + 1} />
//         ))}
//       </div>
//     </div>
//   );
// }
