
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TextCheckPage = lazy(() => import('./pages/TextCheckPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const TextToSpeechPage = lazy(() => import('./pages/TextToSpeechPage'));
const ImageGeneratorPage = lazy(() => import('./pages/ImageGeneratorPage'));
const ImageGalleryPage = lazy(() => import('./pages/ImageGalleryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DictionaryPage = lazy(() => import('./pages/DictionaryPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCancelledPage = lazy(() => import('./pages/PaymentCancelledPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const SSMLGuidePage = lazy(() => import('./pages/SSMLGuidePage'));
const TextToSpeechV2 = lazy(() => import('./pages/TextToSpeechV2'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-primary dark:bg-dark-primary text-text-primary dark:text-dark-text-primary transition-colors duration-300">
            <Header />
            <main className="flex-grow flex flex-col">
              <Suspense fallback={<LoadingSpinner />}>
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
                      <Route path="text-to-speech-v2" element={<TextToSpeechV2 />} />
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
              </Suspense>
            </main>
            <Footer />
            <AuthModal />
          </div>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
