import React from 'react';
import { Navigation } from '@/components/Navigation';
import { BottomNavigation } from '@/components/mobile/BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showNavigation?: boolean;
}

export const Layout = ({ children, activeTab, onTabChange, showNavigation = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showNavigation ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          <div className="lg:col-span-1 hidden lg:block">
            <Navigation activeTab={activeTab} onTabChange={onTabChange} />
          </div>
          <div className="lg:col-span-3 pb-20 lg:pb-0">
            {children}
          </div>
        </div>
      ) : (
        <div className="p-6 pb-20 lg:pb-6">
          {children}
        </div>
      )}
      
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};