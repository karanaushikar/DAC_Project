import { Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts and Components
import MainLayout from './components/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Import All Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import UploadAssetPage from './pages/UploadAssetPage';
import LibraryPage from './pages/LibraryPage';
import ReviewQueuePage from './pages/ReviewQueuePage';         // <-- IMPORT
import AdminDashboard from './pages/AdminDashboard';
import MyCollectionsPage from './pages/MyCollectionPage';
import CollectionDetailPage from './pages/CollectionDetailPage';

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES (No sidebar) --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* --- PRIVATE USER & REVIEWER ROUTES (Wrapped in MainLayout to get the sidebar) --- */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-asset" element={<UploadAssetPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/review-queue" element={<ReviewQueuePage />} /> {/* <-- ADDED REVIEWER ROUTE */}
        <Route path="/my-collections" element={<MyCollectionsPage />} />
        <Route path="/collection/:id" element={<CollectionDetailPage />} /> 
      </Route>

      {/* --- PRIVATE ADMIN ROUTES (Also wrapped in MainLayout for a consistent UI) --- */}
      <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
        {/* Note: We used specific paths from the sidebar instead of a generic /admin */}
        <Route path="/admin" element={<AdminDashboard />} /> {/* <-- ADDED ADMIN ROUTE */}
        
      </Route>

      {/* --- FALLBACK ROUTES --- */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;