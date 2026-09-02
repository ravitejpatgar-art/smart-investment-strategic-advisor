import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { StatsSection } from './StatsSection';
import { InteractiveCalculator } from './InteractiveCalculator';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07090e] text-slate-900 dark:text-slate-100 selection:bg-[#00D4AA]/20 selection:text-[#0D9488] font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <InteractiveCalculator />
      </main>
      <Footer />
    </div>
  );
};
