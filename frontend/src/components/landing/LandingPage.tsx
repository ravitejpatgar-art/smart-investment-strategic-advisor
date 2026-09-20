import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { StatsSection } from './StatsSection';
import { InteractiveCalculator } from './InteractiveCalculator';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] selection:bg-emerald-500 selection:text-slate-950 font-sans">
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
