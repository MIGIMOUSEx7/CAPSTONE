import React, { useState } from 'react';

export default function AIVision() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [cropType, setCropType] = useState('EGGPLANT');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); 
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('crop_type', cropType);

    try {
      const response = await fetch('http://192.168.100.212:8000/api/analyze-freshness/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data); // This contains your processed_image_base64
      } else {
        console.error("Server error:", response.status);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">AI Vision Scanner</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4">Configuration</h2>
            <select 
              value={cropType} 
              onChange={(e) => setCropType(e.target.value)}
              className="w-full p-2 border rounded-xl mb-4"
            >
              <option value="EGGPLANT">🍆 Eggplant</option>
              <option value="CUCUMBER">🥒 Cucumber</option>
              <option value="CARROT">🥕 Carrot</option>
            </select>
            <input type="file" onChange={handleImageChange} className="mb-4" />
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-3 bg-[#2A6B48] text-white rounded-xl font-bold"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4">Result</h2>
            {result && result.processed_image_base64 ? (
              <img 
                src={result.processed_image_base64} 
                alt="AI Analysis" 
                className="w-full rounded-xl border"
              />
            ) : previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full rounded-xl border" />
            ) : (
              <div className="h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                Awaiting Scan...
              </div>
            )}
            {result && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="font-bold">Status: {result.freshness_status}</p>
                <p className="text-sm">Model: {result.model_prediction}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}