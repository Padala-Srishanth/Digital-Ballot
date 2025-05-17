
import React, { useEffect, useState } from 'react';
import { useVotingSystem } from '@/context/VotingSystemContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { Candidate } from '@/models/types';
import CandidateCard from './CandidateCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VoterDashboard = () => {
  const { auth, logout, election, getVoterVote, getCandidatesByGender, hasVotedForGender } = useVotingSystem();
  const [votedMaleCandidate, setVotedMaleCandidate] = useState<Candidate | null>(null);
  const [votedFemaleCandidate, setVotedFemaleCandidate] = useState<Candidate | null>(null);
  const [maleCandidates, setMaleCandidates] = useState<Candidate[]>([]);
  const [femaleCandidates, setFemaleCandidates] = useState<Candidate[]>([]);
  
  useEffect(() => {
    // Update candidates lists
    setMaleCandidates(getCandidatesByGender('male'));
    setFemaleCandidates(getCandidatesByGender('female'));
    
    if (!auth.currentUser) return;
    
    // Get the candidates the user voted for
    if (auth.currentUser.id) {
      const maleCandidate = getVoterVote(auth.currentUser.id, 'male');
      const femaleCandidate = getVoterVote(auth.currentUser.id, 'female');
      
      setVotedMaleCandidate(maleCandidate);
      setVotedFemaleCandidate(femaleCandidate);
    }
  }, [auth.currentUser, election.voters, getVoterVote, getCandidatesByGender]);
  
  if (!auth.currentUser) return null;

  // Check if voter has voted in both categories
  const hasVotedInAllCategories = 
    (votedMaleCandidate !== null && votedFemaleCandidate !== null) ||
    (auth.currentUser.id && hasVotedForGender(auth.currentUser.id, 'male') && hasVotedForGender(auth.currentUser.id, 'female'));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {auth.currentUser.name}!</h1>
        <Button variant="outline" onClick={logout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      {!election.isOpen && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Election Closed</AlertTitle>
          <AlertDescription>
            The election is currently not open for voting. Please check back later.
          </AlertDescription>
        </Alert>
      )}
      
      {hasVotedInAllCategories && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Votes Recorded</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>Thank you for casting your votes! Your votes have been successfully recorded for both categories.</span>
            
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {votedMaleCandidate && (
                <div className="p-3 bg-white rounded-lg border border-green-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ballot-light-blue flex items-center justify-center text-ballot-blue font-bold">
                    {votedMaleCandidate.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">Male Category: <span className="text-ballot-blue">{votedMaleCandidate.name}</span></p>
                    <p className="text-sm text-gray-500">{votedMaleCandidate.party}</p>
                  </div>
                </div>
              )}
              
              {votedFemaleCandidate && (
                <div className="p-3 bg-white rounded-lg border border-green-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ballot-light-blue flex items-center justify-center text-ballot-blue font-bold">
                    {votedFemaleCandidate.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">Female Category: <span className="text-ballot-blue">{votedFemaleCandidate.name}</span></p>
                    <p className="text-sm text-gray-500">{votedFemaleCandidate.party}</p>
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="male">
        <TabsList className="w-full">
          <TabsTrigger value="male" className="w-1/2">Male Candidates</TabsTrigger>
          <TabsTrigger value="female" className="w-1/2">Female Candidates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="male">
          <Card>
            <CardHeader>
              <CardTitle>Male Candidates</CardTitle>
              <CardDescription>
                {auth.currentUser.id && hasVotedForGender(auth.currentUser.id, 'male')
                  ? "You have already voted for a male candidate."
                  : election.isOpen 
                    ? "Select a male candidate to vote"
                    : "The election is currently closed."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maleCandidates.map((candidate) => (
                  <CandidateCard 
                    key={candidate.id} 
                    candidate={candidate} 
                    isSelected={votedMaleCandidate?.id === candidate.id}
                  />
                ))}
                
                {maleCandidates.length === 0 && (
                  <p className="col-span-3 text-center py-6 text-gray-500">No male candidates available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="female">
          <Card>
            <CardHeader>
              <CardTitle>Female Candidates</CardTitle>
              <CardDescription>
                {auth.currentUser.id && hasVotedForGender(auth.currentUser.id, 'female')
                  ? "You have already voted for a female candidate."
                  : election.isOpen 
                    ? "Select a female candidate to vote"
                    : "The election is currently closed."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {femaleCandidates.map((candidate) => (
                  <CandidateCard 
                    key={candidate.id} 
                    candidate={candidate} 
                    isSelected={votedFemaleCandidate?.id === candidate.id}
                  />
                ))}
                
                {femaleCandidates.length === 0 && (
                  <p className="col-span-3 text-center py-6 text-gray-500">No female candidates available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoterDashboard;
