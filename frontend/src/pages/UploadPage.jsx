import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, File as FileIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    onDropRejected: (fileRejections) => {
      if (fileRejections[0].errors[0].code === 'file-too-large') {
        setError('File is larger than 50MB limit');
      } else {
        setError('Invalid file');
      }
    }
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // In development, Vite proxied to 5000. In prod, same domain.
      const res = await axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      // Pass the qr code and details to display page via state
      navigate(`/qr/${res.data.fileId}`, { 
        state: { 
          qrCode: res.data.qrCode, 
          fileURL: res.data.fileURL,
          fileName: file.name
        } 
      });

    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed due to an error.');
      setUploading(false);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setProgress(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 rounded-3xl w-full flex flex-col gap-6"
    >
      <div 
        {...getRootProps()} 
        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' 
            : file 
              ? 'border-slate-600 bg-slate-800/50' 
              : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'
        }`}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div 
              key="upload-prompt"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center shadow-inner mb-2">
                <UploadCloud className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-lg font-medium text-slate-200">
                {isDragActive ? 'Drop your file here...' : 'Click or Drag & Drop'}
              </p>
              <p className="text-sm text-slate-500">
                Any file type up to 50MB
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="file-preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full z-10"
            >
              <button 
                onClick={removeFile}
                className="absolute top-4 right-4 p-1.5 bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-full transition-colors z-20"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center shadow-lg border border-indigo-500/30 mb-4">
                <FileIcon className="w-8 h-8 text-indigo-300" />
              </div>
              <p className="text-base font-semibold text-white max-w-full truncate px-4 text-center">
                {file.name}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              
              {uploading && (
                <div className="w-full mt-6 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 ${
          !file 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
            : uploading
              ? 'bg-indigo-600/50 cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading {progress}%
          </>
        ) : (
          'Generate Link & QR'
        )}
      </button>
    </motion.div>
  );
}
