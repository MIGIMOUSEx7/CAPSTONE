import React, { useState, useRef } from 'react';
import { Zap, RefreshCw, AlertCircle } from 'lucide-react';

export default function AIVision() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState(false);
  
  // Reference to the live video image so we can screenshot it
  const imgRef = useRef(null);

  // Using the Vite proxy path!
  const ESP32_STREAM_URL = `/api/camera/stream`;

  const captureAndAnalyze = async () => {
    setIsLoading(true);
    
    try {
      // 1. Grab the current frame from the live video feed
      const imgElement = imgRef.current;
      if (!imgElement) throw new Error("Stream not visible");

      // 2. Create an invisible canvas to "screenshot" the image
      const canvas = document.createElement('canvas');
      canvas.width = imgElement.naturalWidth || 640;
      canvas.height = imgElement.naturalHeight || 480;
      const ctx = canvas.getContext('2d');
      
      // Draw the current video frame onto the canvas
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

      // 3. Convert the canvas into a file (Blob)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));

      // 4. Send the screenshot to your Django AI Backend
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');
      formData.append('crop_type', 'EGGPLANT'); // You can make this dynamic later!

      const djangoResponse = await fetch('/api/analyze-freshness/', {
        method: 'POST',
        body: formData,
      });
      
      if (!djangoResponse.ok) throw new Error("Django AI server failed to respond");
      
      const data = await djangoResponse.json();
      setResult(data);
      
    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("Failed to analyze: " + error.message + ". Is Django running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">AI Vision Scanner</h1>
        <p className="text-sm text-slate-500">Live Analysis - Bulua WBIT</p>
      </div>

      <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center">
        {!streamError ? (
          <img 
            ref={imgRef}
            src={ESP32_STREAM_URL}
            alt="ESP32-CAM Live Feed"
            className="w-full h-full object-cover"
            onError={() => setStreamError(true)}
            // crossOrigin="anonymous" is no longer needed because the Vite Proxy makes it "Same Origin"!
          />
        ) : (
          <div className="text-white text-center p-4">
            <AlertCircle size={40} className="mx-auto mb-2 text-rose-500" />
            <p>Stream Offline.</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-xs underline">Retry Connection</button>
          </div>
        )}
      </div>

      <button 
        onClick={captureAndAnalyze} 
        disabled={isLoading || streamError}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all shadow-md
          ${isLoading ? 'bg-slate-400' : 'bg-[#2A6B48] hover:bg-[#1f5035]'}`}
      >
        {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
        {isLoading ? 'Processing AI...' : 'Snap & Analyze'}
      </button>

      {result && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6 animate-fadeIn">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Analysis Result</h2>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Status</p>
              {/* NEW: Handle the UNKNOWN status gracefully */}
              <p className={`font-bold text-lg 
                ${result.freshness_status === 'GREEN' ? 'text-[#2A6B48]' : 
                  result.freshness_status === 'UNKNOWN' ? 'text-slate-500' : 'text-rose-500'}`}>
                {result.freshness_status === 'GREEN' ? 'Fresh / Safe' : 
                 result.freshness_status === 'UNKNOWN' ? 'Subject Not Recognized' : 'At-Risk / Rotten'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Confidence</p>
              <p className="font-bold text-lg text-slate-800">
                {(result.ml_confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {result.processed_image_base64 && (
            <div className="mt-4 rounded-xl overflow-hidden border-2 border-slate-100">
              <p className="bg-slate-50 text-xs font-bold text-slate-500 p-2 text-center border-b border-slate-100">
                SVM Bounding Box Output
              </p>
              <img src={result.processed_image_base64} alt="AI Result" className="w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}