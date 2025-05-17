
// Definition for a Voter
export interface Voter {
  id: string;
  name: string;
  hasVoted: boolean;
  password: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  photoUrl?: string;
  votedFor?: {
    male?: number;
    female?: number;
  }; // Track which candidates the voter voted for by gender
}

// Definition for a Candidate
export interface Candidate {
  id: number;
  name: string;
  party: string;
  votes: number;
  gender: 'male' | 'female'; // Add gender field to candidates
  rollNo: string; // Add roll number field
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUser: Voter | null;
  adminUsername: string | null;
}

// Election state
export interface ElectionState {
  isOpen: boolean;
  candidates: Candidate[];
  voters: Voter[];
}
