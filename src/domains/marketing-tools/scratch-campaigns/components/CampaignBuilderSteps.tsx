/**
 * Additional Step Components for Scratch Campaign Builder
 * Prizes, Settings, and Preview steps
 */

import React, { useState } from 'react';
import { Plus, Trash2, Gift, Calendar, Settings as SettingsIcon, Play } from 'lucide-react';
import type { CreateScratchCampaignRequest } from '../types';

// Prizes Step Component
export function PrizesStep({ 
  data, 
  onChange, 
  onNext, 
  onBack 
}: { 
  data: Partial<CreateScratchCampaignRequest>; 
  onChange: (data: Partial<CreateScratchCampaignRequest>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const prizes = data.prizes || [];

  const addPrize = () => {
    onChange({
      ...data,
      prizes: [
        ...prizes,
        {
          type: 'discount',
          title: '',
          description: '',
          value: '',
          quantity: 1,
          win_probability: 10,
          redemption_instructions: ''
        }
      ]
    });
  };

  const updatePrize = (index: number, updates: Partial<typeof prizes[0]>) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], ...updates };
    onChange({ ...data, prizes: updatedPrizes });
  };

  const removePrize = (index: number) => {
    onChange({
      ...data,
      prizes: prizes.filter((_, i) => i !== index)
    });
  };

  const totalProbability = prizes.reduce((sum, prize) => sum + prize.win_probability, 0);
  const isValid = prizes.length > 0 && totalProbability <= 100 && prizes.every(p => p.title && p.value);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Prize Configuration</h2>
        <button
          onClick={addPrize}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add Prize
        </button>
      </div>

      {prizes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No prizes configured yet</p>
          <button
            onClick={addPrize}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Your First Prize
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {prizes.map((prize, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Prize #{index + 1}</h3>
                <button
                  onClick={() => removePrize(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prize Type
                  </label>
                  <select
                    value={prize.type}
                    onChange={(e) => updatePrize(index, { type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="discount">Discount</option>
                    <option value="free_item">Free Item</option>
                    <option value="gift_card">Gift Card</option>
                    <option value="experience">Experience</option>
                    <option value="cashback">Cashback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prize Title *
                  </label>
                  <input
                    type="text"
                    value={prize.title}
                    onChange={(e) => updatePrize(index, { title: e.target.value })}
                    placeholder="e.g., 50% Off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prize Value *
                  </label>
                  <input
                    type="text"
                    value={prize.value}
                    onChange={(e) => updatePrize(index, { value: e.target.value })}
                    placeholder="e.g., 50% discount, $25 gift card"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={prize.quantity}
                    onChange={(e) => updatePrize(index, { quantity: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Win Probability (%)
                  </label>
                  <input
                    type="number"
                    value={prize.win_probability}
                    onChange={(e) => updatePrize(index, { win_probability: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={prize.expiry_date || ''}
                    onChange={(e) => updatePrize(index, { expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Redemption Instructions
                </label>
                <textarea
                  value={prize.redemption_instructions || ''}
                  onChange={(e) => updatePrize(index, { redemption_instructions: e.target.value })}
                  placeholder="How customers can redeem this prize..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}

          {/* Probability Summary */}
          <div className={`p-4 rounded-lg ${totalProbability > 100 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Win Probability:</span>
              <span className={`font-bold ${totalProbability > 100 ? 'text-red-600' : 'text-blue-600'}`}>
                {totalProbability.toFixed(1)}%
              </span>
            </div>
            {totalProbability > 100 && (
              <p className="text-red-600 text-sm mt-1">
                ⚠️ Total probability cannot exceed 100%
              </p>
            )}
            <p className="text-gray-600 text-sm mt-1">
              Remaining cards will be losing cards: {(100 - totalProbability).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-6 py-2 rounded-md font-medium ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next: Settings
        </button>
      </div>
    </div>
  );
}

// Settings Step Component
export function SettingsStep({ 
  data, 
  onChange, 
  onNext, 
  onBack 
}: { 
  data: Partial<CreateScratchCampaignRequest>; 
  onChange: (data: Partial<CreateScratchCampaignRequest>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Campaign Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Start Date
          </label>
          <input
            type="datetime-local"
            value={data.start_date || ''}
            onChange={(e) => onChange({ ...data, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign End Date
          </label>
          <input
            type="datetime-local"
            value={data.end_date || ''}
            onChange={(e) => onChange({ ...data, end_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Custom Messages</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Win Message
          </label>
          <input
            type="text"
            value={data.win_message || 'Congratulations! You won!'}
            onChange={(e) => onChange({ ...data, win_message: e.target.value })}
            placeholder="Message shown when customer wins"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lose Message
          </label>
          <input
            type="text"
            value={data.lose_message || 'Try again next time!'}
            onChange={(e) => onChange({ ...data, lose_message: e.target.value })}
            placeholder="Message shown when customer doesn't win"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instruction Text
          </label>
          <input
            type="text"
            value={data.instruction_text || 'Scratch to reveal your prize!'}
            onChange={(e) => onChange({ ...data, instruction_text: e.target.value })}
            placeholder="Instructions shown before scratching"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          Next: Preview
        </button>
      </div>
    </div>
  );
}

// Preview Step Component
export function PreviewStep({ 
  data, 
  onBack, 
  onCreateCampaign, 
  isCreating 
}: { 
  data: Partial<CreateScratchCampaignRequest>; 
  onBack: () => void;
  onCreateCampaign: () => void;
  isCreating: boolean;
}) {
  const totalPrizes = data.prizes?.reduce((sum, prize) => sum + prize.quantity, 0) || 0;
  const totalProbability = data.prizes?.reduce((sum, prize) => sum + prize.win_probability, 0) || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Campaign Preview</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaign Summary */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Overview</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{data.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Business:</span>
                <span className="font-medium">{data.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cards:</span>
                <span className="font-medium">{data.total_cards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prize Count:</span>
                <span className="font-medium">{data.prizes?.length || 0} types</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Prizes:</span>
                <span className="font-medium">{totalPrizes} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Win Rate:</span>
                <span className="font-medium">{totalProbability.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Prizes Summary */}
          {data.prizes && data.prizes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Prizes</h3>
              <div className="space-y-2">
                {data.prizes.map((prize, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{prize.title}</span>
                      <span className="text-gray-600 ml-2">({prize.type})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{prize.quantity}x</div>
                      <div className="text-sm text-gray-600">{prize.win_probability}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Visual Preview */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Visual Preview</h3>
          
          <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-gray-900">{data.business_name}</h4>
              <p className="text-gray-600">{data.name}</p>
            </div>
            
            {/* Mock scratch card */}
            <div 
              className={`w-64 h-40 mx-auto flex items-center justify-center text-center ${
                data.card_design?.card_shape === 'rounded' ? 'rounded-lg' :
                data.card_design?.card_shape === 'circular' ? 'rounded-full' : 'rounded-none'
              }`}
              style={{ 
                backgroundColor: data.card_design?.background_color || '#1E3A8A',
                color: data.card_design?.text_color || '#FFFFFF',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Content */}
              <div className="relative z-10 p-4">
                <div 
                  className="text-lg font-bold mb-2"
                  style={{ color: data.card_design?.accent_color || '#F59E0B' }}
                >
                  🎁 {data.prizes?.[0]?.title || 'PRIZE!'}
                </div>
                <div className="text-sm">
                  {data.prizes?.[0]?.value || 'Scratch to reveal!'}
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                {data.instruction_text || 'Scratch to reveal your prize!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isCreating}
          className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onCreateCampaign}
          disabled={isCreating}
          className="flex items-center gap-2 px-8 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Campaign...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Create Campaign
            </>
          )}
        </button>
      </div>
    </div>
  );
}