
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useVotingSystem } from '@/context/VotingSystemContext';
import { UserIcon, ShieldIcon, Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const { login } = useVotingSystem();
  const [voterId, setVoterId] = useState('');
  const [voterPassword, setVoterPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoterPassword, setShowVoterPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleVoterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      login(voterId, false, voterPassword);
      setIsLoading(false);
    }, 800); // Small delay for animation effect
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      login('admin', true, adminPassword, adminUsername);
      setIsLoading(false);
    }, 800); // Small delay for animation effect
  };

  return (
    <Card className="w-[380px] shadow-lg animate-fade-in bg-gradient-to-br from-white to-ballot-light-blue border border-ballot-blue/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-ballot-blue">Online Voting System</CardTitle>
        <CardDescription className="text-center">Login to access the voting system</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voter" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="voter" className="flex items-center gap-2 data-[state=active]:bg-ballot-blue data-[state=active]:text-white">
              <UserIcon className="w-4 h-4" />
              <span>Voter</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-ballot-blue data-[state=active]:text-white">
              <ShieldIcon className="w-4 h-4" />
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="voter" className="animate-fade-in">
            <form onSubmit={handleVoterLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="voterId">Voter ID</Label>
                  <Input 
                    id="voterId" 
                    placeholder="Enter your voter ID"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    required
                    className="transition-all focus-within:ring-ballot-blue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="voterPassword">Password</Label>
                  <div className="relative">
                    <Input 
                      id="voterPassword" 
                      type={showVoterPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={voterPassword}
                      onChange={(e) => setVoterPassword(e.target.value)}
                      required
                      className="transition-all focus-within:ring-ballot-blue pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowVoterPassword(!showVoterPassword)}
                    >
                      {showVoterPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full bg-ballot-blue hover:bg-ballot-blue/80 transition-all" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Login as Voter"}
                </Button>
              </div>
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <p></p>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="admin" className="animate-fade-in">
            <form onSubmit={handleAdminLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adminUsername">Admin Username</Label>
                  <Input 
                    id="adminUsername" 
                    placeholder="Enter admin username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    className="transition-all focus-within:ring-ballot-blue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <div className="relative">
                    <Input 
                      id="adminPassword" 
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="transition-all focus-within:ring-ballot-blue pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                    >
                      {showAdminPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full bg-ballot-blue hover:bg-ballot-blue/80 transition-all" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Login as Admin"}
                </Button>
              </div>
              
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <p>Demo admin: admin / admin123</p>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        © Online Voting System. All rights reserved.
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
