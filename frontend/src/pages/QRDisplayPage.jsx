import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Copy, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function QRDisplayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [copied, setCopied] = useState(false);

  // If accessed directly without state, redirect to home
  if (!location.state?.qrCode) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-400 mb-4">No QR Code found to display.</p>
        <button onClick={() => navigate('/')} className="text-indigo-400 underline">
          Go back to upload
        </button>
      </div>
    );
  }

  const { qrCode, fileURL, fileName } = location.state;

  const handleCopy = () => {
    navigator.clipboard.writeText(fileURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = qrCode;
    a.download = `share-${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-8 rounded-3xl w-full flex flex-col items-center"
    >
      <div className="w-full flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" /> Ready
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-500/10 mb-6">
        <img src={qrCode} alt="File QR Code" className="w-48 h-48 object-contain" />
      </div>

      <div className="text-center mb-8 w-full">
        <h2 className="text-xl font-bold text-white mb-2 truncate px-4">{fileName}</h2>
        <p className="text-slate-400 text-sm">Scan to access on your local network</p>
      </div>

      <div className="flex gap-4 w-full">
        <button 
          onClick={handleCopy}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied URL!' : 'Copy Link'}
        </button>
        
        <button 
          onClick={handleDownloadQR}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Save QR
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 w-full">
        <p className="text-xs text-slate-500 text-center">
          Note: This file will automatically expire and be deleted after 1 hour.
        </p>
      </div>
    </motion.div>
  );
}
