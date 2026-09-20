import React, { useState, useEffect } from 'react';
import { UserProfile, AssessmentResult, ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { AssessmentTypes } from './components/AssessmentTypes';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { AuthModal } from './components/AuthModal';
import { AssessmentApp } from './components/AssessmentApp';
import { Dashboard } from './components/Dashboard';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [results, setResults] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    // Check saved demo user or session
    const savedUser = localStorage.getItem('nbass_demo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const savedResults = localStorage.getItem('nbass_results');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('nbass_demo_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nbass_demo_user');
    setActiveTab('landing');
  };

  const handleStartAssessment = () => {
    if (!user) {
      // If not logged in, prompt auth or allow guest demo mode
      setIsAuthModalOpen(true);
    } else {
      setActiveTab('assessment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveResult = (newResult: AssessmentResult) => {
    const updated = [newResult, ...results];
    setResults(updated);
    localStorage.setItem('nbass_results', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onStartAssessment={handleStartAssessment}
      />

      {/* Main Content View Switcher */}
      <main className="flex-grow">
        {activeTab === 'landing' && (
          <>
            <Hero
              onStartAssessment={handleStartAssessment}
              onExploreFeatures={() => {
                const el = document.getElementById('features-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <Features />
            <AssessmentTypes />
            <Testimonials />
            <Pricing onStartAssessment={handleStartAssessment} />
            <FAQ />
          </>
        )}

        {activeTab === 'assessment' && (
          <AssessmentApp
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSaveResult={handleSaveResult}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            results={results}
            onStartAssessment={() => {
              setActiveTab('assessment');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          handleLoginSuccess(u);
          setActiveTab('assessment');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
