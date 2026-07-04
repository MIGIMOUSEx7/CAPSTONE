import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, AlertCircle, Clock, Activity, ScanLine, StopCircle } from 'lucide-react';

export default function AIVision() {
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamError, setStreamError] = useState(false);
  
  // NEW: Auto-Scan State
  const [isAutoMode, setIsAutoMode] = useState(false);
  
  const imgRef = useRef(null);
  const processingRef = useRef(false); // Used to prevent overlapping scans

  // ⚠️ Ensure your Vite proxy is pointing to your ESP32's NEW IP address!
  const ESP32_STREAM_URL = `/api/camera/stream`;

  // The main scanning function
  const captureAndAnalyze = async (isAuto = false) => {
    // If we are already processing a frame, skip this one
    if (processingRef.current) return;
    
    processingRef.current = true;
    if (!isAuto) setIsProcessing(true);

    try {
      const imgElement = imgRef.current;
      if (!imgElement) throw new Error("Stream not visible");

      // 1. Grab the current frame from the live video feed
      const canvas = document.createElement('canvas');
      canvas.width = imgElement.naturalWidth || 640;
      canvas.height = imgElement.naturalHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));

      // 2. Package it and send to Django
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      const response = await fetch('/api/analyze-freshness/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error("Backend analysis failed");
      const data = await response.json();
      
      // 3. MAGIC LOGIC: Filter out empty scans
      // If we are in Auto-Mode AND the AI didn't find a crop, IGNORE IT.
      if (isAuto && data.freshness_status === 'UNKNOWN') {
        // Do nothing, just silently finish processing
        return;
      }
      
      // 4. If a crop IS found (or if the user manually clicked), add it to history
      const newRecord = {
        ...data,
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      setHistory(prevHistory => [newRecord, ...prevHistory]);
      
    } catch (error) {
      console.error("Analysis Error:", error);
      if (!isAuto) alert("Failed to capture and analyze: " + error.message);
    } finally {
      processingRef.current = false;
      if (!isAuto) setIsProcessing(false);
    }
  };

  // NEW: The "Live Auto-Scan" Interval Loop
  useEffect(() => {
    let intervalId;
    if (isAutoMode) {
      // Run the scanner every 3 seconds (3000ms)
      intervalId = setInterval(() => {
        captureAndAnalyze(true);
      }, 3000); 
    }
    
    // Cleanup interval when auto-mode is turned off
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoMode]); // Cleaned up dependencies

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Live AI Vision</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time hardware monitoring & auto-spoilage detection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Live Feed & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Camera size={18} className="text-[#2A6B48]" />
                ESP32-CAM Node 01
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE
                </span>
              </div>
            </div>
            
            {/* Camera Stream Container */}
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              {!streamError ? (
                <>
                  <img 
                    ref={imgRef}
                    src={ESP32_STREAM_URL}
                    alt="ESP32-CAM Live Feed"
                    className="w-full h-full object-contain"
                    // Optional: If your camera is upside down, uncomment the line below!
                    // style={{ transform: 'rotate(180deg)' }} 
                    onError={() => setStreamError(true)}
                  />
                  
                  {/* Visual Indicator when Auto-Scan is running */}
                  {isAutoMode && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-md border border-emerald-500/30 flex items-center gap-2 animate-pulse">
                      <ScanLine size={14} />
                      Auto-Scanning...
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-400 text-center p-6 flex flex-col items-center">
                  <AlertCircle size={48} className="mb-3 text-rose-500 opacity-80" />
                  <p className="font-medium text-white mb-1">Camera Stream Offline</p>
                  <p className="text-xs text-slate-500 max-w-xs mb-4">Make sure the ESP32 is powered on and connected to your local network.</p>
                  <button onClick={() => setStreamError(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-colors">
                    Retry Connection
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
              {/* Button 1: Manual Capture */}
              <button 
                onClick={() => captureAndAnalyze(false)} 
                disabled={isProcessing || streamError || isAutoMode}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-slate-700 transition-all border-2 
                  ${(isProcessing || isAutoMode) ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />}
                Manual Snap
              </button>

              {/* Button 2: Auto-Scan Toggle */}
              <button 
                onClick={() => setIsAutoMode(!isAutoMode)} 
                disabled={streamError}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all shadow-sm
                  ${isAutoMode 
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                    : 'bg-[#2A6B48] hover:bg-[#1f5035] shadow-emerald-900/20'}`}
              >
                {isAutoMode ? <StopCircle size={18} /> : <ScanLine size={18} />}
                {isAutoMode ? 'Stop Auto-Scan' : 'Start Live Auto-Scan'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: History Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Scan History</h2>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{history.length} logs</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                <ScanLine size={40} className="mb-3 opacity-20" />
                <p className="font-bold text-slate-500">Waiting for detections...</p>
                <p className="text-xs mt-1">Start "Auto-Scan" and place a vegetable in front of the camera.</p>
              </div>
            ) : (
              history.map((record) => (
                <div key={record.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-fadeIn">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-400">{record.timestamp}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border
                      ${record.freshness_status === 'GREEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        record.freshness_status === 'UNKNOWN' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                        'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {record.freshness_status === 'GREEN' ? 'Fresh' : record.freshness_status === 'UNKNOWN' ? 'No Match' : 'At-Risk'}
                    </span>
                  </div>
                  
                  {/* Bounding Box Image Result */}
                  {record.processed_image_base64 && (
                    <div className="rounded-lg overflow-hidden border border-slate-100 mb-3 bg-black aspect-video flex items-center justify-center relative">
                      <img src={record.processed_image_base64} alt="Analyzed Crop" className="w-full h-full object-contain" />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Detected</p>
                      <p className="font-bold text-slate-800">{record.crop_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">AI Confidence</p>
                      <p className="font-bold text-[#2A6B48]">{(record.ml_confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}