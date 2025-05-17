import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Candidate, Voter, AuthState, ElectionState } from '@/models/types';
import { useToast } from '@/components/ui/use-toast';
import { format, differenceInYears } from 'date-fns';

interface VotingSystemContextType {
  auth: AuthState;
  election: ElectionState;
  login: (id: string, isAdmin?: boolean, password?: string, username?: string) => boolean;
  logout: () => void;
  castVote: (voterId: string, candidateId: number) => boolean;
  addVoter: (voter: Omit<Voter, 'hasVoted'>) => boolean;
  addCandidate: (id: number, name: string, party: string, gender: 'male' | 'female', rollNo: string) => boolean;
  setElectionStatus: (status: boolean) => void;
  simulateConcurrentVoting: () => void;
  getVoterVote: (voterId: string, gender: 'male' | 'female') => Candidate | null;
  getCandidatesByGender: (gender: 'male' | 'female') => Candidate[];
  hasVotedForGender: (voterId: string, gender: 'male' | 'female') => boolean;
}

const defaultAuth: AuthState = {
  isAuthenticated: false,
  isAdmin: false,
  currentUser: null,
  adminUsername: null
};

// Generate the voters array with the requested roll numbers
const generateVoters = () => {
  const maleNames = [
    "Aarav", "Arjun", "Vikram", "Rohan", "Vivaan", "Advait", "Ishaan", "Dhruv", 
    "Reyansh", "Vihaan", "Kabir", "Arnav", "Shaurya", "Atharv", "Ayaan", "Aditya", 
    "Shivansh", "Karan", "Rishabh", "Krish", "Varun", "Yash", "Aryan", "Veer", 
    "Siddharth", "Rudra", "Pranav", "Om", "Vedant", "Dev", "Ishan", "Virat"
  ];
  const femaleNames = [
    "Aanya", "Aadhya", "Saanvi", "Ananya", "Pari", "Myra", "Avni", "Riya", 
    "Aditi", "Kiara", "Anvi", "Navya", "Diya", "Ishita", "Anika", "Kavya", 
    "Kritika", "Nisha", "Prisha", "Siya", "Tanvi", "Vanya", "Zara", "Ahana", 
    "Amaira", "Divya", "Gauri", "Isha", "Kaira", "Meera", "Neha", "Trisha", "Sameera"
  ];
  
  const voters: Voter[] = [];
  
  // Generate roll numbers from 23071A67D1 to 23071A67K5
  const baseRollNo = "23071A67";
  let count = 0;
  
  // First section: D1 to D9
  for (let i = 1; i <= 9; i++) {
    const rollNo = `${baseRollNo}D${i}`;
    const gender = count % 2 === 0 ? 'male' : 'female';
    const name = gender === 'male' 
      ? maleNames[count % maleNames.length] 
      : femaleNames[count % femaleNames.length];
    
    voters.push({ 
      id: rollNo, 
      name, 
      hasVoted: false, 
      password: rollNo,
      gender: gender as 'male' | 'female' | 'other'
    });
    count++;
  }
  
  // Second section: E0 to E9, F0 to F9, etc. up to K5
  const suffixes = ['E', 'F', 'G', 'H', 'I', 'J', 'K'];
  for (const letter of suffixes) {
    const end = letter === 'K' ? 5 : 9;
    for (let i = 0; i <= end; i++) {
      const rollNo = `${baseRollNo}${letter}${i}`;
      const gender = count % 2 === 0 ? 'male' : 'female';
      const name = gender === 'male' 
        ? maleNames[count % maleNames.length] 
        : femaleNames[count % femaleNames.length];
      
      voters.push({ 
        id: rollNo, 
        name, 
        hasVoted: false, 
        password: rollNo,
        gender: gender as 'male' | 'female' | 'other'
      });
      count++;
    }
  }
  
  return voters;
};

const defaultElection: ElectionState = {
  isOpen: false,
  candidates: [
    { id: 1, name: "Pranav Babu", party: "Male CR", votes: 0, gender: 'male', rollNo: '23071A67K0' },
    { id: 2, name: "Zomiro", party: "Male CR", votes: 0, gender: 'male', rollNo: '23071A67K1' },
    { id: 3, name: "Sahasra Reddy", party: "Female CR", votes: 0, gender: 'female', rollNo: '23071A67F3' },
    { id: 4, name: "Suketha", party: "Female CR", votes: 0, gender: 'female', rollNo: '23071A67F4' }
  ],
  voters: generateVoters()
};

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const VotingSystemContext = createContext<VotingSystemContextType | undefined>(undefined);

export const VotingSystemProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(defaultAuth);
  const [election, setElection] = useState<ElectionState>(defaultElection);
  const { toast } = useToast();

  // Helper function to get candidates by gender
  const getCandidatesByGender = (gender: 'male' | 'female'): Candidate[] => {
    return election.candidates.filter(c => c.gender === gender);
  };

  // Helper function to check if a voter has voted for a specific gender
  const hasVotedForGender = (voterId: string, gender: 'male' | 'female'): boolean => {
    const voter = election.voters.find(v => v.id === voterId);
    if (!voter || !voter.votedFor) return false;
    
    return gender === 'male' 
      ? voter.votedFor.male !== undefined
      : voter.votedFor.female !== undefined;
  };

  const login = (id: string, isAdmin = false, password?: string, username?: string): boolean => {
    if (isAdmin) {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setAuth({
          isAuthenticated: true,
          isAdmin: true,
          currentUser: null,
          adminUsername: username
        });
        toast({
          title: "Admin Login Successful",
          description: `Welcome back, ${username}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      // Update voter login to allow voters who have already voted
      const voter = election.voters.find(v => v.id === id && v.password === password);
      if (voter) {
        setAuth({
          isAuthenticated: true,
          isAdmin: false,
          currentUser: voter,
          adminUsername: null
        });
        toast({
          title: "Login Successful",
          description: `Welcome, ${voter.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid voter credentials.",
          variant: "destructive",
        });
        return false;
      }
    }
  };

  // Add the missing logout function
  const logout = () => {
    setAuth(defaultAuth);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  // New function to get the candidate a voter has voted for by gender
  const getVoterVote = (voterId: string, gender: 'male' | 'female'): Candidate | null => {
    const voter = election.voters.find(v => v.id === voterId);
    
    // If voter hasn't voted or doesn't exist, return null
    if (!voter || !voter.votedFor) {
      return null;
    }
    
    // Get the candidate ID for the specific gender
    const candidateId = gender === 'male' ? voter.votedFor.male : voter.votedFor.female;
    if (candidateId === undefined) {
      return null;
    }
    
    // Find the candidate the voter voted for
    const candidate = election.candidates.find(c => c.id === candidateId);
    return candidate || null;
  };

  const castVote = (voterId: string, candidateId: number): boolean => {
    if (!election.isOpen) {
      toast({
        title: "Voting Failed",
        description: "Election is not open yet.",
        variant: "destructive",
      });
      return false;
    }

    const voterIndex = election.voters.findIndex(v => v.id === voterId);
    if (voterIndex === -1) {
      toast({
        title: "Voting Failed",
        description: "Invalid voter ID.",
        variant: "destructive",
      });
      return false;
    }

    const candidateIndex = election.candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      toast({
        title: "Voting Failed",
        description: "Invalid candidate ID.",
        variant: "destructive",
      });
      return false;
    }

    const candidate = election.candidates[candidateIndex];
    const voter = election.voters[voterIndex];

    // Check if the voter has already voted for this gender category
    if (voter.votedFor && ((candidate.gender === 'male' && voter.votedFor.male !== undefined) || 
        (candidate.gender === 'female' && voter.votedFor.female !== undefined))) {
      toast({
        title: "Voting Failed",
        description: `You've already voted for a ${candidate.gender} candidate.`,
        variant: "destructive",
      });
      return false;
    }

    // Update the election state with the new vote
    const updatedVoters = [...election.voters];
    const updatedVotedFor = {
      ...(voter.votedFor || {}),
      [candidate.gender]: candidateId
    };
    
    // Update voter's votedFor record
    updatedVoters[voterIndex] = {
      ...updatedVoters[voterIndex],
      votedFor: updatedVotedFor,
      hasVoted: true // Mark as voted if they've voted in at least one category
    };

    const updatedCandidates = [...election.candidates];
    updatedCandidates[candidateIndex] = {
      ...updatedCandidates[candidateIndex],
      votes: updatedCandidates[candidateIndex].votes + 1
    };

    setElection({
      ...election,
      voters: updatedVoters,
      candidates: updatedCandidates
    });

    // Update the current user if it's the one voting
    if (auth.currentUser?.id === voterId) {
      setAuth({
        ...auth,
        currentUser: {
          ...auth.currentUser,
          hasVoted: true,
          votedFor: updatedVotedFor
        }
      });
    }

    toast({
      title: "Vote Cast Successfully!",
      description: `Your vote for ${candidate.gender} candidate has been recorded.`,
      variant: "default",
    });

    return true;
  };

  const addVoter = (voter: Omit<Voter, 'hasVoted'>): boolean => {
    // Check if voter ID already exists
    if (election.voters.some(v => v.id === voter.id)) {
      toast({
        title: "Error Adding Voter",
        description: "Voter ID already exists.",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate voter ID format: A6 followed by 8 more characters
    const voterIdPattern = /^(?=.*A6).{10}$/;
    if (!voterIdPattern.test(voter.id)) {
      toast({
        title: "Error Adding Voter",
        description: "Voter ID must start with A6 and be 10 characters long.",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if voter is at least 18 years old
    if (voter.dob) {
      const birthDate = new Date(voter.dob);
      const age = differenceInYears(new Date(), birthDate);
      
      if (age < 18) {
        toast({
          title: "Error Adding Voter",
          description: "Voter must be at least 18 years old to be eligible.",
          variant: "destructive",
        });
        return false;
      }
    }

    setElection({
      ...election,
      voters: [...election.voters, { ...voter, hasVoted: false }]
    });

    toast({
      title: "Voter Added",
      description: `${voter.name} has been added as a voter.`,
    });
    
    return true;
  };

  const addCandidate = (id: number, name: string, party: string, gender: 'male' | 'female', rollNo: string): boolean => {
    // Check if candidate ID already exists
    if (election.candidates.some(c => c.id === id)) {
      toast({
        title: "Error Adding Candidate",
        description: "Candidate ID already exists.",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate roll number format: A6 followed by 8 more characters
    const rollNoPattern = /^(?=.*A6).{10}$/;
    if (!rollNoPattern.test(rollNo)) {
      toast({
        title: "Error Adding Candidate",
        description: "Roll number must start with A6 and be 10 characters long.",
        variant: "destructive",
      });
      return false;
    }

    // Check if roll number already exists
    if (election.candidates.some(c => c.rollNo === rollNo)) {
      toast({
        title: "Error Adding Candidate",
        description: "Candidate with this roll number already exists.",
        variant: "destructive",
      });
      return false;
    }

    setElection({
      ...election,
      candidates: [...election.candidates, { id, name, party, votes: 0, gender, rollNo }]
    });

    toast({
      title: "Candidate Added",
      description: `${name} has been added as a ${gender} candidate.`,
    });
    
    return true;
  };

  const setElectionStatus = (status: boolean) => {
    setElection({
      ...election,
      isOpen: status
    });

    toast({
      title: `Election ${status ? "Opened" : "Closed"}`,
      description: `The election is now ${status ? "open for voting" : "closed. No more votes can be cast."}`,
    });
  };

  const simulateConcurrentVoting = () => {
    // Add test voters if they don't exist
    const testVoterIds = ["A6SIM10001", "A6SIM10002", "A6SIM10003", "A6SIM10004", "A6SIM10005"];
    const testVoterNames = ["Test Voter 1", "Test Voter 2", "Test Voter 3", "Test Voter 4", "Test Voter 5"];
    const testVoterGenders = ["male", "female", "male", "female", "male"];
    
    let updatedVoters = [...election.voters];
    
    // Add test voters if they don't exist
    testVoterIds.forEach((id, index) => {
      if (!updatedVoters.some(v => v.id === id)) {
        updatedVoters.push({ 
          id, 
          name: testVoterNames[index], 
          hasVoted: false,
          password: `pass${id}`, 
          gender: testVoterGenders[index] as 'male' | 'female' | 'other'
        });
      }
    });
    
    // Update voters first
    setElection({
      ...election,
      voters: updatedVoters,
      isOpen: true
    });
    
    // Filter candidates by gender
    const maleCandidates = election.candidates.filter(c => c.gender === 'male');
    const femaleCandidates = election.candidates.filter(c => c.gender === 'female');
    
    if (maleCandidates.length === 0 || femaleCandidates.length === 0) {
      toast({
        title: "Simulation Error",
        description: "Need at least one male and one female candidate for simulation.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate concurrent voting with timeouts to visualize
    setTimeout(() => castVote("A6SIM10001", maleCandidates[0].id), 500);
    setTimeout(() => castVote("A6SIM10001", femaleCandidates[0].id), 800);
    setTimeout(() => castVote("A6SIM10002", maleCandidates[1 % maleCandidates.length].id), 1100);
    setTimeout(() => castVote("A6SIM10002", femaleCandidates[1 % femaleCandidates.length].id), 1400);
    setTimeout(() => castVote("A6SIM10003", maleCandidates[2 % maleCandidates.length].id), 1700);
    
    toast({
      title: "Simulation Started",
      description: "Simulating concurrent voting with test voters...",
    });
  };

  const value = {
    auth,
    election,
    login,
    logout,
    castVote,
    addVoter,
    addCandidate,
    setElectionStatus,
    simulateConcurrentVoting,
    getVoterVote,
    getCandidatesByGender,
    hasVotedForGender
  };

  return (
    <VotingSystemContext.Provider value={value}>
      {children}
    </VotingSystemContext.Provider>
  );
};

export const useVotingSystem = () => {
  const context = useContext(VotingSystemContext);
  if (context === undefined) {
    throw new Error('useVotingSystem must be used within a VotingSystemProvider');
  }
  return context;
};
