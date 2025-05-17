
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useVotingSystem } from '@/context/VotingSystemContext';
import { UserPlus, UserSquare, ArrowUpDown, BarChart3, PlayCircle, LogOut, Calendar, Camera, User } from 'lucide-react';
import ElectionResults from './ElectionResults';
import { format } from 'date-fns';
import { Voter } from '@/models/types';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { logout, election, addVoter, addCandidate, setElectionStatus, simulateConcurrentVoting } = useVotingSystem();
  const { toast } = useToast();
  
  // State for new voter form
  const [newVoter, setNewVoter] = useState<Omit<Voter, 'hasVoted'>>({
    id: '',
    name: '',
    password: '',
    gender: 'male',
    dob: '',
    photoUrl: ''
  });
  
  // State for ID validation
  const [voterIdError, setVoterIdError] = useState<string | null>(null);
  
  // State for new candidate form
  const [newCandidate, setNewCandidate] = useState({ 
    id: '', 
    name: '', 
    party: '',
    gender: 'male',
    rollNo: ''
  });
  
  // State for roll number validation
  const [rollNoError, setRollNoError] = useState<string | null>(null);
  
  // State for simulation status and photo input
  const [isSimulating, setIsSimulating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Validate voter ID format: A6 followed by 8 more characters
  const validateVoterId = (id: string): boolean => {
    const pattern = /^23071A6\d[D-K]\d$/;
    return pattern.test(id);
  };
  
  const handleVoterIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value;
    setNewVoter({...newVoter, id: newId});
    
    if (newId && !validateVoterId(newId)) {
      setVoterIdError("Voter ID must start with A6 and be 10 characters long");
    } else {
      setVoterIdError(null);
    }
  };

  const handleRollNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRollNo = e.target.value;
    setNewCandidate({...newCandidate, rollNo: newRollNo});
    
    if (newRollNo && !validateVoterId(newRollNo)) {
      setRollNoError("Roll number must start with A6 and be 10 characters long");
    } else {
      setRollNoError(null);
    }
  };
  
  const handleAddVoter = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate voter ID before submission
    if (!validateVoterId(newVoter.id)) {
      toast({
        title: "Invalid Voter ID",
        description: "Voter ID must start with A6 and be 10 characters long",
        variant: "destructive",
      });
      return;
    }
    
    const success = addVoter(newVoter);
    if (success) {
      setNewVoter({
        id: '',
        name: '',
        password: '',
        gender: 'male',
        dob: '',
        photoUrl: ''
      });
      setPhotoPreview(null);
      setVoterIdError(null);
    }
  };
  
  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate roll number
    if (!validateVoterId(newCandidate.rollNo)) {
      toast({
        title: "Invalid Roll Number",
        description: "Roll number must start with A6 and be 10 characters long",
        variant: "destructive",
      });
      return;
    }
    
    const success = addCandidate(
      parseInt(newCandidate.id), 
      newCandidate.name, 
      newCandidate.party, 
      newCandidate.gender as 'male' | 'female',
      newCandidate.rollNo
    );
    
    if (success) {
      setNewCandidate({ 
        id: '', 
        name: '', 
        party: '',
        gender: 'male',
        rollNo: ''
      });
      setRollNoError(null);
    }
  };
  
  const handleSimulate = () => {
    setIsSimulating(true);
    simulateConcurrentVoting();
    setTimeout(() => setIsSimulating(false), 3000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setNewVoter({ ...newVoter, photoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate a unique voter ID starting with A6
  const generateVoterId = () => {
    // Generate A6 prefix
    const prefix = 'A6';
    
    // Generate a random 8-character alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 8; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return prefix + suffix;
  };

  // Generate a random password
  const generatePassword = () => {
    return 'pass' + Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Auto-generate ID and password
  const handleAutoGenerate = () => {
    const newId = generateVoterId();
    setNewVoter({
      ...newVoter,
      id: newId,
      password: generatePassword()
    });
    setVoterIdError(null); // Clear any errors since we're generating a valid ID
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={logout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{election.voters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{election.candidates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Election Status</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className={`text-lg font-medium ${election.isOpen ? 'text-green-500' : 'text-red-500'}`}>
              {election.isOpen ? 'Open' : 'Closed'}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              onClick={() => setElectionStatus(!election.isOpen)}
              variant={election.isOpen ? "destructive" : "default"}
              className="w-full"
            >
              {election.isOpen ? 'Close Election' : 'Open Election'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="results">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-4">
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="voters" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Add Voter</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <UserSquare className="w-4 h-4" />
            <span>Add Candidate</span>
          </TabsTrigger>
          <TabsTrigger value="simulate" className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            <span>Simulate</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="results">
          <ElectionResults />
        </TabsContent>
        
        <TabsContent value="voters">
          <Card>
            <CardHeader>
              <CardTitle>Add New Voter</CardTitle>
              <CardDescription>
                Register a new voter in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVoter}>
                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="voter-id">Voter ID (Enter your Roll Number)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="voter-id" 
                          placeholder="e.g. 23071A67D1"
                          value={newVoter.id}
                          onChange={handleVoterIdChange}
                          required
                          className={`flex-1 ${voterIdError ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {voterIdError && <p className="text-xs text-red-500">{voterIdError}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="voter-password">Password</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="voter-password" 
                          placeholder="Enter voter password"
                          value={newVoter.password}
                          onChange={(e) => setNewVoter({...newVoter, password: e.target.value})}
                          required
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAutoGenerate}
                          className="whitespace-nowrap"
                        >
                          Auto Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="voter-name">Full Name</Label>
                    <Input 
                      id="voter-name" 
                      placeholder="Enter voter's full name"
                      value={newVoter.name}
                      onChange={(e) => setNewVoter({...newVoter, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Gender</Label>
                    <RadioGroup 
                      value={newVoter.gender}
                      onValueChange={(value) => setNewVoter({...newVoter, gender: value as 'male' | 'female' | 'other'})}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="voter-dob">Date of Birth</Label>
                    <Input 
                      id="voter-dob" 
                      type="date"
                      value={newVoter.dob}
                      onChange={(e) => setNewVoter({...newVoter, dob: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 18 years old to be eligible to vote</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="voter-photo">Photo</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Voter" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input 
                          id="voter-photo" 
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="mb-2"
                        />
                        <p className="text-xs text-muted-foreground">Upload a clear photo of the voter (optional)</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={!!voterIdError}
                  >
                    Add Voter
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Registered Voters</CardTitle>
              <CardDescription>
                List of all registered voters in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">ID</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Gender</th>
                      <th className="text-left p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {election.voters.map((voter) => (
                      <tr key={voter.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{voter.id}</td>
                        <td className="p-4">{voter.name}</td>
                        <td className="p-4">{voter.gender || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${voter.hasVoted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {voter.hasVoted ? 'Voted' : 'Not Voted'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Add New Candidate</CardTitle>
              <CardDescription>
                Register a new candidate for the election
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCandidate}>
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="candidate-id">Candidate ID</Label>
                      <Input 
                        id="candidate-id" 
                        placeholder="Enter unique candidate ID (number)"
                        value={newCandidate.id}
                        onChange={(e) => setNewCandidate({...newCandidate, id: e.target.value})}
                        required
                        type="number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="candidate-roll">Roll Number (starts with A6, 10 characters)</Label>
                      <Input 
                        id="candidate-roll" 
                        placeholder="e.g. A6ABC1234"
                        value={newCandidate.rollNo}
                        onChange={handleRollNoChange}
                        required
                        className={`${rollNoError ? 'border-red-500' : ''}`}
                      />
                      {rollNoError && <p className="text-xs text-red-500">{rollNoError}</p>}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="candidate-name">Full Name</Label>
                    <Input 
                      id="candidate-name" 
                      placeholder="Enter candidate name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Gender</Label>
                    <RadioGroup 
                      value={newCandidate.gender}
                      onValueChange={(value) => setNewCandidate({...newCandidate, gender: value as 'male' | 'female'})}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="candidate-male" />
                        <Label htmlFor="candidate-male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="candidate-female" />
                        <Label htmlFor="candidate-female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="candidate-party">Party/Affiliation</Label>
                    <Input 
                      id="candidate-party" 
                      placeholder="Enter party or affiliation"
                      value={newCandidate.party}
                      onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!!rollNoError}
                  >
                    Add Candidate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Registered Candidates</CardTitle>
              <CardDescription>
                List of all registered candidates in the election
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">ID</th>
                      <th className="text-left p-4 font-medium">Roll No</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Gender</th>
                      <th className="text-left p-4 font-medium">Party</th>
                      <th className="text-right p-4 font-medium">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {election.candidates.map((candidate) => (
                      <tr key={candidate.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{candidate.id}</td>
                        <td className="p-4">{candidate.rollNo}</td>
                        <td className="p-4">{candidate.name}</td>
                        <td className="p-4">{candidate.gender}</td>
                        <td className="p-4">{candidate.party}</td>
                        <td className="p-4 text-right">{candidate.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="simulate">
          <Card>
            <CardHeader>
              <CardTitle>Simulate Concurrent Voting</CardTitle>
              <CardDescription>
                Simulate multiple voters casting votes at the same time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This simulation will add test voters (if they don't exist already) and simulate them casting votes
                  for different candidates. The election will be opened if it's not already open.
                </p>
                
                <Button 
                  onClick={handleSimulate} 
                  disabled={isSimulating} 
                  className="w-full"
                >
                  {isSimulating ? (
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 animate-pulse" />
                      Simulation in progress...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Start Simulation
                    </div>
                  )}
                </Button>
                
                {isSimulating && (
                  <div className="border rounded-md p-4 bg-muted/50">
                    <p className="text-sm font-medium">Simulation log:</p>
                    <div className="space-y-1 mt-2 text-xs font-mono">
                      <p>Adding test voters if they don't exist...</p>
                      <p>Opening election...</p>
                      <p className="animate-pulse">Processing votes...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
