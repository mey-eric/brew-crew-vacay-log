
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Beer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useUser } from '@/contexts/UserContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast("Login successful! Welcome back to BeerTracker.");
      navigate('/dashboard');
    } catch (error) {
      toast("Login failed. Invalid email or password. Please try again.");
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
            <CardTitle className="text-3xl font-bold text-center text-beer-dark">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your BeerTracker account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-beer-red hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-beer-red hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>For demo purposes, you can use:</p>
          <p>Email: john@example.com</p>
          <p>Password: any password will work</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
