import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import QRDisplayPage from './pages/QRDisplayPage';
import FileAccessPage from './pages/FileAccessPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col items-center py-10 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <header className="mb-12 text-center z-10 w-full px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm mb-2 font-outfit">
            Local QR File Share
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium">
            Securely share files on your local network
          </p>
        </header>

        <main className="z-10 w-full max-w-lg px-4 flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/qr/:id" element={<QRDisplayPage />} />
            <Route path="/file/:id" element={<FileAccessPage />} />
          </Routes>
        </main>
        
        <footer className="mt-auto pt-8 text-slate-500 text-sm z-10">
          <p>Restricted to Local Network Only</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
