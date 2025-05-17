
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Candidate } from '@/models/types';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { useVotingSystem } from '@/context/VotingSystemContext';
import ConfettiEffect from './ConfettiEffect';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected?: boolean;
}

const CandidateCard = ({ candidate, isSelected = false }: CandidateCardProps) => {
  const { auth, castVote, hasVotedForGender } = useVotingSystem();
  const [showConfetti, setShowConfetti] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Check if current user has already voted for this gender category
  const hasVotedForCategory = auth.currentUser?.id 
    ? hasVotedForGender(auth.currentUser.id, candidate.gender)
    : false;

  const handleVote = () => {
    if (auth.currentUser?.id) {
      const result = castVote(auth.currentUser.id, candidate.id);
      if (result) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        setOpen(false);
      }
    }
  };

  return (
    <>
      {showConfetti && <ConfettiEffect />}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className={`candidate-card cursor-pointer hover:border-ballot-blue ${isSelected ? 'border-2 border-ballot-blue bg-ballot-light-blue/20' : ''}`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full ${isSelected ? 'bg-ballot-blue text-white' : 'bg-ballot-light-blue text-ballot-blue'} flex items-center justify-center text-xl font-bold mb-3`}>
                {candidate.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-lg mb-1">{candidate.name}</h3>
              <p className="text-sm text-gray-500 mb-1">{candidate.party}</p>
              <p className="text-xs text-gray-400 mb-4">
                Roll No: {candidate.rollNo} | {candidate.gender === 'male' ? 'Male' : 'Female'}
              </p>
              {isSelected ? (
                <Button 
                  variant="outline" 
                  className="border-ballot-blue bg-ballot-blue text-white"
                  disabled={true}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Voted
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="vote-button border-ballot-blue text-ballot-blue hover:bg-ballot-blue hover:text-white"
                  disabled={hasVotedForCategory}
                >
                  Vote
                </Button>
              )}
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              You are about to cast your vote for {candidate.gender === 'male' ? 'male' : 'female'} category:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="w-24 h-24 rounded-full bg-ballot-light-blue flex items-center justify-center text-ballot-blue text-2xl font-bold mb-4">
              {candidate.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="font-bold text-xl">{candidate.name}</h3>
            <p className="text-gray-500 mb-1">{candidate.party}</p>
            <p className="text-xs text-gray-400">Roll No: {candidate.rollNo} | {candidate.gender === 'male' ? 'Male' : 'Female'}</p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              className="bg-ballot-blue hover:bg-blue-700 flex gap-2 items-center" 
              onClick={handleVote}
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CandidateCard;
