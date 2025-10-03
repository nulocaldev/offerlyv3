/**
 * Interactive Scratch-and-Win Game Component
 * The customer-facing scratch game interface
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Gift, Share2, Copy, ExternalLink } from 'lucide-react';
import { scratchCampaignService } from '../service';
import type { ScratchGameState, Prize } from '../types';

interface ScratchGameProps {
  campaignId: string;
  playerIdentifier: string;
  onGameComplete?: (result: { is_winner: boolean; prize?: Prize; claim_code?: string }) => void;
}

export function ScratchGame({ campaignId, playerIdentifier, onGameComplete }: ScratchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<ScratchGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [scratchPositions, setScratchPositions] = useState<Array<{ x: number; y: number; timestamp: number }>>([]);
  const [gameResult, setGameResult] = useState<{
    is_winner: boolean;
    prize?: Prize;
    message: string;
    claim_code?: string;
  } | null>(null);

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, [campaignId, playerIdentifier]);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const initialState = await scratchCampaignService.startPlaySession(campaignId, playerIdentifier);
      setGameState(initialState);
      
      // Initialize canvas after state is set
      setTimeout(() => {
        initializeCanvas();
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 320;
    canvas.height = 200;

    // Draw scratch layer
    ctx.fillStyle = gameState.config.card_design.scratch_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add scratch pattern/texture
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  };

  const getEventPos = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const startScratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsScratching(true);
    performScratch(e);
  }, []);

  const performScratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pos = getEventPos(e);
    
    // Add to scratch positions
    const newPosition = { x: pos.x, y: pos.y, timestamp: Date.now() };
    setScratchPositions(prev => [...prev, newPosition]);

    // Perform scratch effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
    setScratchProgress(percentage);

    // Auto-reveal if scratched enough
    if (percentage > 50 && !gameResult) {
      completeGame();
    }
  }, [isScratching, gameResult]);

  const stopScratch = useCallback(() => {
    setIsScratching(false);
    
    // Update progress on server
    if (gameState?.session && scratchPositions.length > 0) {
      scratchCampaignService.updateScratchProgress(
        gameState.session.id,
        scratchPositions,
        scratchProgress
      );
    }
  }, [gameState, scratchPositions, scratchProgress]);

  const completeGame = async () => {
    if (!gameState?.session || gameResult) return;

    try {
      const result = await scratchCampaignService.completeScratch(gameState.session.id);
      setGameResult(result);
      
      // Clear canvas to show result
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      onGameComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete game');
    }
  };

  const copyClaimCode = () => {
    if (gameResult?.claim_code) {
      navigator.clipboard.writeText(gameResult.claim_code);
      alert('Claim code copied to clipboard!');
    }
  };

  const shareResult = () => {
    const text = gameResult?.is_winner 
      ? `I just won ${gameResult.prize?.title} at ${gameState?.campaign.business_name}! Try your luck too!`
      : `I just played a fun scratch game at ${gameState?.campaign.business_name}! Try your luck!`;
    
    if (navigator.share) {
      navigator.share({
        title: gameState?.campaign.name,
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Share text copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Game Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeGame}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return <div>Game not loaded</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
        <h2 className="text-xl font-bold">{gameState.campaign.business_name}</h2>
        <p className="text-blue-100">{gameState.campaign.name}</p>
      </div>

      {/* Game Area */}
      <div className="p-6">
        {!gameResult ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {gameState.config.instruction_text}
            </p>
            
            {/* Scratch Card */}
            <div className="relative inline-block">
              {/* Background content (prize reveal) */}
              <div 
                className={`absolute inset-0 flex items-center justify-center text-center ${
                  gameState.config.card_design.card_shape === 'rounded' ? 'rounded-lg' :
                  gameState.config.card_design.card_shape === 'circular' ? 'rounded-full' : ''
                }`}
                style={{ 
                  backgroundColor: gameState.config.card_design.background_color,
                  color: gameState.config.card_design.text_color,
                  width: 320,
                  height: 200
                }}
              >
                <div>
                  <div 
                    className="text-3xl font-bold mb-2"
                    style={{ color: gameState.config.card_design.accent_color }}
                  >
                    🎁
                  </div>
                  <div className="text-lg font-medium">
                    Scratch to reveal!
                  </div>
                </div>
              </div>
              
              {/* Scratch overlay canvas */}
              <canvas
                ref={canvasRef}
                className={`relative z-10 cursor-pointer ${
                  gameState.config.card_design.card_shape === 'rounded' ? 'rounded-lg' :
                  gameState.config.card_design.card_shape === 'circular' ? 'rounded-full' : ''
                }`}
                onMouseDown={startScratch}
                onMouseMove={performScratch}
                onMouseUp={stopScratch}
                onMouseLeave={stopScratch}
                onTouchStart={startScratch}
                onTouchMove={performScratch}
                onTouchEnd={stopScratch}
                style={{ touchAction: 'none' }}
              />
            </div>
            
            {/* Progress */}
            {scratchProgress > 0 && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${Math.min(scratchProgress, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {Math.round(scratchProgress)}% scratched
                </p>
              </div>
            )}
            
            {scratchProgress > 20 && (
              <button
                onClick={completeGame}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Reveal Result
              </button>
            )}
          </div>
        ) : (
          /* Result Display */
          <div className="text-center">
            <div className={`text-6xl mb-4 ${gameResult.is_winner ? 'animate-bounce' : ''}`}>
              {gameResult.is_winner ? '🎉' : '😊'}
            </div>
            
            <h3 className={`text-2xl font-bold mb-2 ${
              gameResult.is_winner ? 'text-green-600' : 'text-blue-600'
            }`}>
              {gameResult.message}
            </h3>
            
            {gameResult.is_winner && gameResult.prize && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">You won:</span>
                </div>
                <div className="text-lg font-bold text-green-900">
                  {gameResult.prize.title}
                </div>
                <div className="text-green-700">
                  {gameResult.prize.value}
                </div>
                
                {gameResult.claim_code && (
                  <div className="mt-3 p-2 bg-white border border-green-300 rounded">
                    <div className="text-sm text-green-700 mb-1">Claim Code:</div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-green-900 flex-1">
                        {gameResult.claim_code}
                      </code>
                      <button
                        onClick={copyClaimCode}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {gameResult.prize.redemption_instructions && (
                  <div className="mt-3 text-sm text-green-700">
                    <strong>How to redeem:</strong> {gameResult.prize.redemption_instructions}
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={shareResult}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScratchGame;