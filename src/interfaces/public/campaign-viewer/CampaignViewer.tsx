import React from 'react';

const CampaignViewer: React.FC = () => {
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

export default CampaignViewer;
