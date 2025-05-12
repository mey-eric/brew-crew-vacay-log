
import React from 'react';
import { Link } from 'react-router-dom';
import { Beer, Users, ChartBar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-beer-cream">
      <Navbar />
      
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-6xl font-bold text-beer-dark mb-4">
                Track Your <span className="text-beer-amber">Beer</span> Adventure
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Keep track of your beer consumption during vacations with friends. 
                Compare, compete, and celebrate your beer journey together!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button className="bg-beer-amber hover:bg-beer-dark text-beer-dark hover:text-beer-cream px-8 py-6 text-lg">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-beer-dark text-beer-dark hover:bg-beer-amber px-8 py-6 text-lg">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center relative">
              <div className="w-72 h-72 bg-beer-amber rounded-full flex items-center justify-center relative overflow-hidden">
                <Beer className="w-40 h-40 text-beer-dark" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-beer-foam opacity-80 rounded-t-full">
                  <div className="bubbles">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute bg-white rounded-full animate-bubble opacity-70"
                        style={{
                          width: `${Math.random() * 10 + 5}px`,
                          height: `${Math.random() * 10 + 5}px`,
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${Math.random() * 3 + 2}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center text-beer-dark mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-beer-cream rounded-lg p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-beer-amber rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-beer-dark" />
              </div>
              <h3 className="font-bold text-xl text-beer-dark mb-2">Create Your Group</h3>
              <p className="text-gray-700">Sign up and invite your friends to join your beer tracking group.</p>
            </div>
            
            <div className="bg-beer-cream rounded-lg p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-beer-amber rounded-full flex items-center justify-center mb-4">
                <Beer className="h-8 w-8 text-beer-dark" />
              </div>
              <h3 className="font-bold text-xl text-beer-dark mb-2">Log Your Beers</h3>
              <p className="text-gray-700">Track each beer with size, type, and automatic timestamps.</p>
            </div>
            
            <div className="bg-beer-cream rounded-lg p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-beer-amber rounded-full flex items-center justify-center mb-4">
                <ChartBar className="h-8 w-8 text-beer-dark" />
              </div>
              <h3 className="font-bold text-xl text-beer-dark mb-2">View Statistics</h3>
              <p className="text-gray-700">See visual charts of consumption patterns for you and your friends.</p>
            </div>
            
            <div className="bg-beer-cream rounded-lg p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-beer-amber rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-beer-dark" />
              </div>
              <h3 className="font-bold text-xl text-beer-dark mb-2">Compare Over Time</h3>
              <p className="text-gray-700">Filter by different time periods to see consumption trends.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-beer-dark text-beer-cream">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Track Your Beer Adventure?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join today and start comparing beer consumption with your friends.
            Create friendly competitions and see who's the beer champion!
          </p>
          <Link to="/signup">
            <Button className="bg-beer-amber hover:bg-beer-cream text-beer-dark hover:text-beer-dark px-8 py-6 text-lg">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
      
      <footer className="bg-beer-amber py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Beer className="h-8 w-8 text-beer-dark" />
              <span className="ml-2 text-xl font-bold text-beer-dark">BeerTracker</span>
            </div>
            <div className="text-beer-dark">
              &copy; {new Date().getFullYear()} BeerTracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
