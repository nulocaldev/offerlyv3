// Public Landing Page - Entry point for discovering and applying to become partners

import React from 'react';
import { Link } from 'react-router-dom';

const PublicLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="border-b border-brand-card-border">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🌟</div>
              <span className="text-xl font-bold text-gradient">Offerly</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-primary">Apply Now</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your Passion for
            <span className="text-gradient block">Local Business</span>
            into Impact
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join our franchise-style network and help small businesses thrive with 
            professional digital marketing campaigns. Build your own agent network 
            or start as an independent marketing specialist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Apply for Regional Partnership
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-brand-card/20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Partner with Offerly?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our domain-separated platform offers powerful marketing tools with a 
              proven franchise business model
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-3">Build Your Network</h3>
              <p className="text-gray-400">
                Recruit and manage neighborhood agents in your territory. 
                Build a franchise-style business with recurring revenue.
              </p>
            </div>
            
            <div className="card hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Marketing Tools Suite</h3>
              <p className="text-gray-400">
                Access professional scratch & win games, social contests, and 
                customer engagement tools that drive real results.
              </p>
            </div>
            
            <div className="card hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-3">Gem Economy</h3>
              <p className="text-gray-400">
                Fair and transparent resource allocation system. 
                Control your costs and scale your operations efficiently.
              </p>
            </div>
            
            <div className="card hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-3">Flexible Pricing</h3>
              <p className="text-gray-400">
                Set your own service rates and collect payments directly. 
                No platform commissions on your service fees.
              </p>
            </div>
            
            <div className="card hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">🎆</div>
              <h3 className="text-xl font-semibold mb-3">Proven Results</h3>
              <p className="text-gray-400">
                Join successful partners already helping local businesses 
                increase customer engagement and drive foot traffic.
              </p>
            </div>
            
            <div className="card hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Growth Potential</h3>
              <p className="text-gray-400">
                Scale from individual agent to regional network manager. 
                Unlimited growth opportunities in your market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Demo */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Architecture</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built with clean domain separation for maximum flexibility and scalability
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card border-brand-yellow">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-brand-yellow mb-4">
                Marketing Tools Domain
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-yellow rounded-full"></span>
                  <span>Interactive scratch & win games</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-yellow rounded-full"></span>
                  <span>Social media contests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-yellow rounded-full"></span>
                  <span>Customer engagement tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-yellow rounded-full"></span>
                  <span>Real-time analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-yellow rounded-full"></span>
                  <span>Prize management</span>
                </li>
              </ul>
            </div>
            
            <div className="card border-brand-pink">
              <div className="text-3xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-brand-pink mb-4">
                Franchise Network Domain
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-pink rounded-full"></span>
                  <span>Three-tier agent hierarchy</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-pink rounded-full"></span>
                  <span>Gem economy management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-pink rounded-full"></span>
                  <span>Territory management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-pink rounded-full"></span>
                  <span>Subscription billing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-pink rounded-full"></span>
                  <span>Independent service pricing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-brand-purple to-brand-light-purple">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our mission to empower local businesses with professional marketing tools
          </p>
          <Link to="/register" className="btn-secondary bg-white text-brand-purple hover:bg-gray-100 text-lg px-8 py-4">
            Apply for Regional Partnership
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-card-border py-8">
        <div className="container-custom text-center text-gray-400">
          <p>&copy; 2024 Offerly Platform. Built with domain-separated architecture for maximum flexibility.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLanding;
