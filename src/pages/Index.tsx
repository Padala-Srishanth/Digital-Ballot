
import React from 'react';
import LoginForm from '@/components/LoginForm';
import VoterDashboard from '@/components/VoterDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import Layout from '@/components/Layout';
import { useVotingSystem } from '@/context/VotingSystemContext';

const Index = () => {
  const { auth } = useVotingSystem();
  
  return (
    <Layout>
      {!auth.isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="max-w-md w-full text-center mb-8 animate-fade-in">
            <h1 className="text-5xl font-bold text-ballot-blue mb-3">Digital Ballot</h1>
            <p className="text-gray-600 text-lg">
              A secure and transparent electronic voting system for the CR elections.
            </p>
            <div className="flex justify-center mt-4 space-x-3">
              <span className="inline-flex h-3 w-3 rounded-full bg-ballot-green animate-pulse"></span>
              <span className="inline-flex h-3 w-3 rounded-full bg-ballot-blue animate-pulse delay-100"></span>
              <span className="inline-flex h-3 w-3 rounded-full bg-ballot-red animate-pulse delay-200"></span>
            </div>
          </div>
          <LoginForm />
        </div>
      ) : auth.isAdmin ? (
        <AdminDashboard />
      ) : (
        <VoterDashboard />
      )}
    </Layout>
  );
};

export default Index;
