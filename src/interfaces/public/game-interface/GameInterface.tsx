import React from 'react';

const GameInterface: React.FC = () => {
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

export default GameInterface;
