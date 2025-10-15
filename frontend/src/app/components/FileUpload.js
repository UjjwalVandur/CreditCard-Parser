"use client";
import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const supportedProviders = [
    { name: 'American Express', logo: <img width='40vh' src='Amex-logo.webp'/> },
    { name: 'HDFC', logo: <img width='40vh' src='hdfc-logo.webp'/> },
    { name: 'ICICI', logo: <img width='40vh' src='Icici-logo.webp'/> },
    { name: 'SBI', logo: <img width='40vh' src='sbi-logo.webp'/> },
    { name: 'Bank of Baroda', logo: <img width='40vh' src='bank-of-baroda-logo.webp'/> }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please upload a PDF first!");
      return;
    }
    
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/parse", { method: "POST", body: formData });
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to parse statement");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
                <path d="M2 10h20" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Statement Parser</h1>
              <p className="text-sm text-purple-200">Extract key data from credit card statements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Supported Providers */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">Supported Card Providers</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {supportedProviders.map((provider) => (
              <div key={provider.name} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-6 py-3 flex items-center gap-3 hover:bg-white/15 transition-all">
                <span className="text-2xl">{provider.logo}</span>
                <span className="text-sm font-medium text-white">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>

        {!result ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Upload Statement</h2>
              
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-500/20' 
                    : 'border-white/30 hover:border-white/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <p className="text-lg font-medium text-white mb-2">
                    Drop your PDF here or click to browse
                  </p>
                  <p className="text-sm text-purple-200">
                    Supports PDF files up to 10MB
                  </p>
                </label>
              </div>

              {file && (
                <div className="mt-6 bg-white/5 border border-white/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-purple-200">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Parsing Statement...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Parse Statement
                  </>
                )}
              </button>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-4">Extracted Data Points</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Cardholder Name', desc: 'Account holder information' },
                    { label: 'Last 4 Digits', desc: 'Card identification' },
                    { label: 'Billing Cycle', desc: 'Statement period' },
                    { label: 'Payment Due Date', desc: 'When payment is due' },
                    { label: 'Total Amount Due', desc: 'Balance to be paid' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-purple-200">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <svg className="w-8 h-8 text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <h3 className="text-base font-bold text-white mb-2">Secure Processing</h3>
                <p className="text-sm text-purple-200">
                  All statements are processed securely and deleted after extraction. Your financial data never leaves our secure servers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h2 className="text-2xl font-bold text-white">Extraction Complete</h2>
              </div>
              <button
                onClick={reset}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
              >
                Parse Another
              </button>
            </div>

            <div className="mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">{result.bank} Statement Details</h3>
              <p className="text-sm text-purple-200">Successfully extracted data from your statement</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <p className="text-sm text-blue-200">Cardholder Name</p>
                </div>
                <p className="text-xl font-bold text-white">{result.cardholder_name}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
                  </svg>
                  <p className="text-sm text-green-200">Last 4 Digits</p>
                </div>
                <p className="text-2xl font-bold text-white">•••• {result.card_last4}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-sm text-pink-200">Billing Cycle</p>
                </div>
                <p className="text-base font-bold text-white">{result.billing_cycle}</p>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-sm text-red-200">Payment Due Date</p>
                </div>
                <p className="text-xl font-bold text-white">{result.payment_due_date}</p>
              </div>

              <div className="md:col-span-2 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-sm text-orange-200">Total Amount Due</p>
                </div>
                <p className="text-3xl font-bold text-white">{result.total_amount_due}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                const dataStr = JSON.stringify(result, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `statement-${result.bank}-${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full mt-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export as JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}