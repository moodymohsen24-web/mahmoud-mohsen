import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TextCheckPage from './pages/TextCheckPage';
import DashboardLayout from './layouts/DashboardLayout';
import DictionaryPage from './pages/DictionaryPage';
import SettingsPage from './pages/SettingsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AuthModal from './components/AuthModal';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';
import TextToSpeechPage from './pages/TextToSpeechPage';
import ProjectsPage from './pages/ProjectsPage';
import SSMLGuidePage from './pages/SSMLGuidePage';
import ImageGeneratorPage from './pages/ImageGeneratorPage';
import ImageGalleryPage from './pages/ImageGalleryPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-primary dark:bg-dark-primary text-text-primary dark:text-dark-text-primary transition-colors duration-300">
          <Header />
          <main className="flex-grow flex flex-col animate-fade-in" style={{ animationDuration: '300ms' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="text-check" element={<TextCheckPage />} />
                  <Route path="text-check/:projectId" element={<TextCheckPage />} />
                  <Route path="dictionary" element={<DictionaryPage />} />
                  <Route path="text-to-speech" element={<TextToSpeechPage />} />
                  <Route path="image-generator" element={<ImageGeneratorPage />} />
                  <Route path="image-gallery" element={<ImageGalleryPage />} />
                  <Route path="ssml-guide" element={<SSMLGuidePage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="checkout/:planId" element={<CheckoutPage />} />
                <Route path="payment-success" element={<PaymentSuccessPage />} />
                <Route path="payment-cancelled" element={<PaymentCancelledPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;