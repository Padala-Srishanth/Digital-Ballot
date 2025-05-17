
import React, { useMemo } from 'react';
import { useVotingSystem } from '@/context/VotingSystemContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Candidate } from '@/models/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ElectionResults = () => {
  const { election, getCandidatesByGender } = useVotingSystem();
  
  // Get candidates by gender
  const maleCandidates = useMemo(() => 
    getCandidatesByGender('male'),
    [election.candidates, getCandidatesByGender]
  );
  
  const femaleCandidates = useMemo(() => 
    getCandidatesByGender('female'),
    [election.candidates, getCandidatesByGender]
  );
  
  // Calculate total votes for each gender category
  const maleTotalVotes = useMemo(() => 
    maleCandidates.reduce((sum, candidate) => sum + candidate.votes, 0),
    [maleCandidates]
  );
  
  const femaleTotalVotes = useMemo(() => 
    femaleCandidates.reduce((sum, candidate) => sum + candidate.votes, 0),
    [femaleCandidates]
  );
  
  // Calculate overall total votes
  const totalVotes = useMemo(() => 
    maleTotalVotes + femaleTotalVotes,
    [maleTotalVotes, femaleTotalVotes]
  );
  
  // Find the winner for male category
  const maleWinner = useMemo(() => {
    if (maleTotalVotes === 0) return null;
    
    return maleCandidates.reduce(
      (max, candidate) => (candidate.votes > max.votes ? candidate : max),
      maleCandidates[0]
    );
  }, [maleCandidates, maleTotalVotes]);
  
  // Find the winner for female category
  const femaleWinner = useMemo(() => {
    if (femaleTotalVotes === 0) return null;
    
    return femaleCandidates.reduce(
      (max, candidate) => (candidate.votes > max.votes ? candidate : max),
      femaleCandidates[0]
    );
  }, [femaleCandidates, femaleTotalVotes]);
  
  // Generate chart data for each gender
  const maleChartData = useMemo(() => 
    maleCandidates.map(candidate => ({
      name: candidate.name,
      votes: candidate.votes,
      percentage: maleTotalVotes ? Math.round((candidate.votes / maleTotalVotes) * 100) : 0
    })),
    [maleCandidates, maleTotalVotes]
  );
  
  const femaleChartData = useMemo(() => 
    femaleCandidates.map(candidate => ({
      name: candidate.name,
      votes: candidate.votes,
      percentage: femaleTotalVotes ? Math.round((candidate.votes / femaleTotalVotes) * 100) : 0
    })),
    [femaleCandidates, femaleTotalVotes]
  );
  
  // Helper function to render winner card
  const WinnerCard = ({ winner, category, totalCategoryVotes }: { winner: Candidate | null, category: string, totalCategoryVotes: number }) => {
    if (!winner || totalCategoryVotes === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No votes have been cast for {category} candidates yet.</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="winner-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" /> 
            {category} Winner
          </CardTitle>
          <CardDescription>Candidate with the most votes in {category} category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-ballot-yellow flex items-center justify-center text-white text-xl font-bold">
              {winner.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg">{winner.name}</h3>
              <p className="text-sm text-gray-500">{winner.party}</p>
              <div className="flex items-center gap-2 mt-1">
                <Award className="h-4 w-4 text-ballot-blue" />
                <span className="font-medium text-ballot-blue">
                  {winner.votes} votes ({Math.round((winner.votes / totalCategoryVotes) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Helper function to render vote distribution
  const VoteDistribution = ({ candidates, chartData, totalCategoryVotes, category }: 
    { candidates: Candidate[], chartData: any[], totalCategoryVotes: number, category: string }) => {
    
    if (totalCategoryVotes === 0) {
      return <p className="text-center py-8 text-muted-foreground">No votes have been cast for {category} candidates yet.</p>;
    }
    
    return (
      <>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value} votes`, 'Votes']}
                labelFormatter={(label) => `Candidate: ${label}`}
              />
              <Bar 
                dataKey="votes" 
                fill="#0056D6"
                animationDuration={1500}
                label={{ 
                  position: 'top',
                  formatter: (value: number) => value > 0 ? value : '',
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-4 mt-6">
          {candidates.map((candidate) => (
            <div key={candidate.id}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{candidate.name}</span>
                <span>
                  {candidate.votes} votes ({totalCategoryVotes ? Math.round((candidate.votes / totalCategoryVotes) * 100) : 0}%)
                </span>
              </div>
              <div className="result-bar">
                <div 
                  className="result-progress"
                  style={{ 
                    width: `${totalCategoryVotes ? Math.round((candidate.votes / totalCategoryVotes) * 100) : 0}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Election Results</h2>
      
      {/* Winners Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WinnerCard winner={maleWinner} category="Male" totalCategoryVotes={maleTotalVotes} />
        <WinnerCard winner={femaleWinner} category="Female" totalCategoryVotes={femaleTotalVotes} />
      </div>
      
      {/* Male Candidates Results */}
      <Card>
        <CardHeader>
          <CardTitle>Male Candidates Results</CardTitle>
          <CardDescription>Total male votes: {maleTotalVotes}</CardDescription>
        </CardHeader>
        <CardContent>
          <VoteDistribution 
            candidates={maleCandidates} 
            chartData={maleChartData} 
            totalCategoryVotes={maleTotalVotes}
            category="male"
          />
        </CardContent>
      </Card>
      
      {/* Female Candidates Results */}
      <Card>
        <CardHeader>
          <CardTitle>Female Candidates Results</CardTitle>
          <CardDescription>Total female votes: {femaleTotalVotes}</CardDescription>
        </CardHeader>
        <CardContent>
          <VoteDistribution 
            candidates={femaleCandidates} 
            chartData={femaleChartData} 
            totalCategoryVotes={femaleTotalVotes}
            category="female"
          />
        </CardContent>
      </Card>
      
      {/* Overall Results Summary - Optional but useful */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Election Summary</CardTitle>
          <CardDescription>
            Total votes cast: {totalVotes}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              <span className="font-semibold">Male Category:</span> {maleTotalVotes} votes ({totalVotes > 0 ? Math.round((maleTotalVotes / totalVotes) * 100) : 0}% of total)
            </p>
            <p>
              <span className="font-semibold">Female Category:</span> {femaleTotalVotes} votes ({totalVotes > 0 ? Math.round((femaleTotalVotes / totalVotes) * 100) : 0}% of total)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionResults;
