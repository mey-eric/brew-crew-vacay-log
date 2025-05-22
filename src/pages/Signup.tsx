
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Beer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useUser } from '@/contexts/UserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signup } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords don't match. Please make sure your passwords match.");
      toast("Passwords don't match. Please make sure your passwords match.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(name, email, password);
      toast("Account created! Welcome to BeerTracker!");
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during sign up.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beer-cream px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Beer className="h-16 w-16 text-beer-amber" />
        </div>
        
        <Card className="border-beer-dark">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-beer-dark">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to create your BeerTracker account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-beer-dark focus:ring-beer-amber"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-beer-dark focus:ring-beer-amber"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-beer-dark focus:ring-beer-amber"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-beer-dark focus:ring-beer-amber"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-beer-amber hover:bg-beer-dark text-beer-dark hover:text-beer-cream"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-beer-red hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
