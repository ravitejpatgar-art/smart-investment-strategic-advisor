import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { StatsSection } from './StatsSection';
import { InteractiveCalculator } from './InteractiveCalculator';
import { TestimonialsSection } from './TestimonialsSection';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <InteractiveCalculator />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};
