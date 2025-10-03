// Placeholder components for the remaining interfaces
// These demonstrate the complete application structure

import React from 'react';

// Login Page
export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="card max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Offerly</h1>
        <form className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input w-full" placeholder="your@email.com" />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" className="form-input w-full" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// Register Page  
export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="card max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-center mb-6">Apply for Partnership</h1>
        <form className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input w-full" placeholder="your@email.com" />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" className="form-input w-full" placeholder="••••••••" />
          </div>
          <div>
            <label className="form-label">Display Name</label>
            <input type="text" className="form-input w-full" placeholder="John Smith" />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select className="form-input w-full">
              <option value="regional_partner">Regional Partner</option>
              <option value="neighborhood_agent">Neighborhood Agent</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

// Campaign Viewer
export const CampaignViewer: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-4">Summer Sale Campaign</h1>
          <p className="text-gray-400 mb-6">Joe's Pizza - Interactive Scratch & Win</p>
          <div className="text-center">
            <div className="text-6xl mb-4">🍕</div>
            <p className="text-lg mb-6">Win up to 50% off your next order!</p>
            <button className="btn-primary text-lg px-8 py-4">
              Play Scratch & Win Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Game Interface
export const GameInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg p-4">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">🎲 Scratch & Win Game</h1>
          <div className="bg-brand-yellow/20 rounded-lg p-8 mb-6">
            <div className="text-8xl mb-4">🎁</div>
            <p className="text-lg">Scratch to reveal your prize!</p>
          </div>
          <button className="btn-primary">
            Start Scratching
          </button>
        </div>
      </div>
    </div>
  );
};

// Export all components
export default {
  LoginPage,
  RegisterPage,
  CampaignViewer,
  GameInterface
};
