import React from 'react';
import { useVotingSystem } from '@/context/VotingSystemContext';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { auth, logout } = useVotingSystem();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-ballot-light-blue/30">
      {/* Header */}
      <header className="bg-gradient-to-r from-ballot-blue to-blue-500 text-white p-4 shadow-md">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            CR Elections
          </h1>
          {auth.isAuthenticated && (
            <div className="flex items-center gap-4">
              <div className="text-sm bg-white/20 px-3 py-1.5 rounded-full">
                {auth.isAdmin 
                  ? `Admin: ${auth.adminUsername}` 
                  : `Voter: ${auth.currentUser?.name}`}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20" 
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container py-8 max-w-7xl">{children}</div>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800 text-white text-center p-4 text-sm">
        <div className="container">
          <p>© 2025 Online Voting System. All rights reserved.</p>
          
          <p className="text-slate-400 text-xs mt-1">Operating • Systems • Project</p>
          <p className="text-slate-400 text-xs mt-1">Secure • Transparent • Reliable</p>
  
        </div>
      </footer>
    </div>
  );
};

export default Layout;
