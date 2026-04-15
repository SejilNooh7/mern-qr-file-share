import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { File as FileIcon, Download, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FileAccessPage() {
  const { id } = useParams();
  const [fileDetails, setFileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await axios.get(`/api/file/${id}`);
        setFileDetails(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access Denied. You are not on the same local network as the server.');
        } else if (err.response?.status === 410 || err.response?.status === 404) {
          setError('File not found or has expired.');
        } else {
          setError('An error occurred while fetching the file.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  const handleDownload = () => {
    // Navigate strictly to the backend download URL so the browser triggers file download
    window.location.href = `/api/download/${id}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p>Verifying secure connection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-3xl w-full flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Error</h2>
        <p className="text-slate-400">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 rounded-3xl w-full flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 flex items-center justify-center shadow-lg border border-indigo-500/30 mb-6">
        <FileIcon className="w-10 h-10 text-indigo-300" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-1 truncate w-full text-center px-2">
        {fileDetails.originalName}
      </h2>
      <p className="text-slate-400 mb-8 flex items-center gap-2">
        <span>{(fileDetails.size / (1024 * 1024)).toFixed(2)} MB</span>
        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> 
          Auto-deletes in {Math.max(0, Math.round((new Date(fileDetails.expiresAt) - new Date()) / 60000))} mins
        </span>
      </p>

      <div className="w-full space-y-4">
        <button 
          onClick={handleDownload}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" /> Download File
        </button>
      </div>
    </motion.div>
  );
}
