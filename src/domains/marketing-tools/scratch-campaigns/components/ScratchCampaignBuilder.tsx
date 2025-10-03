/**
 * Scratch-and-Win Campaign Builder
 * Main interface for creating scratch campaigns
 */

import React, { useState } from 'react';
import { Palette, Gift, Settings, Play, Save, Eye } from 'lucide-react';
import { scratchCampaignService } from '../service';
import { PrizesStep, SettingsStep, PreviewStep } from './CampaignBuilderSteps';
import type { CreateScratchCampaignRequest } from '../types';

interface ScratchCampaignBuilderProps {
  onCampaignCreated?: (campaignId: string) => void;
}

export function ScratchCampaignBuilder({ onCampaignCreated }: ScratchCampaignBuilderProps) {
  const [currentStep, setCurrentStep] = useState<'basic' | 'design' | 'prizes' | 'settings' | 'preview'>('basic');
  const [isCreating, setIsCreating] = useState(false);
  const [campaignData, setCampaignData] = useState<Partial<CreateScratchCampaignRequest>>({
    name: '',
    business_name: '',
    description: '',
    total_cards: 100,
    card_design: {
      background_color: '#1E3A8A',
      scratch_color: '#94A3B8',
      text_color: '#FFFFFF',
      accent_color: '#F59E0B',
      card_shape: 'rounded',
      animation_style: 'fade'
    },
    prizes: [],
    win_message: 'Congratulations! You won!',
    lose_message: 'Try again next time!',
    instruction_text: 'Scratch to reveal your prize!'
  });

  const steps = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'design', label: 'Card Design', icon: Palette },
    { id: 'prizes', label: 'Prizes', icon: Gift },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  const handleCreateCampaign = async () => {
    if (!campaignData.name || !campaignData.business_name || !campaignData.prizes?.length) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const campaignId = await scratchCampaignService.createCampaign(campaignData as CreateScratchCampaignRequest);
      onCampaignCreated?.(campaignId);
      alert('Campaign created successfully!');
      
      // Reset form
      setCampaignData({
        name: '',
        business_name: '',
        description: '',
        total_cards: 100,
        card_design: {
          background_color: '#1E3A8A',
          scratch_color: '#94A3B8',
          text_color: '#FFFFFF',
          accent_color: '#F59E0B',
          card_shape: 'rounded',
          animation_style: 'fade'
        },
        prizes: [],
        win_message: 'Congratulations! You won!',
        lose_message: 'Try again next time!',
        instruction_text: 'Scratch to reveal your prize!'
      });
      setCurrentStep('basic');
    } catch (error) {
      alert(`Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎮 Scratch-and-Win Campaign Builder
        </h1>
        <p className="text-gray-600">
          Create engaging scratch-off campaigns that drive customer interaction and boost sales
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {step.label}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {currentStep === 'basic' && (
          <BasicInfoStep 
            data={campaignData} 
            onChange={setCampaignData}
            onNext={() => setCurrentStep('design')}
          />
        )}
        
        {currentStep === 'design' && (
          <DesignStep 
            data={campaignData} 
            onChange={setCampaignData}
            onNext={() => setCurrentStep('prizes')}
            onBack={() => setCurrentStep('basic')}
          />
        )}
        
        {currentStep === 'prizes' && (
          <PrizesStep 
            data={campaignData} 
            onChange={setCampaignData}
            onNext={() => setCurrentStep('settings')}
            onBack={() => setCurrentStep('design')}
          />
        )}
        
        {currentStep === 'settings' && (
          <SettingsStep 
            data={campaignData} 
            onChange={setCampaignData}
            onNext={() => setCurrentStep('preview')}
            onBack={() => setCurrentStep('prizes')}
          />
        )}
        
        {currentStep === 'preview' && (
          <PreviewStep 
            data={campaignData} 
            onBack={() => setCurrentStep('settings')}
            onCreateCampaign={handleCreateCampaign}
            isCreating={isCreating}
          />
        )}
      </div>
    </div>
  );
}

// Basic Info Step Component
function BasicInfoStep({ 
  data, 
  onChange, 
  onNext 
}: { 
  data: Partial<CreateScratchCampaignRequest>; 
  onChange: (data: Partial<CreateScratchCampaignRequest>) => void;
  onNext: () => void;
}) {
  const isValid = data.name && data.business_name;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Campaign Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="e.g., Summer Sale Scratch & Win"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={data.business_name || ''}
            onChange={(e) => onChange({ ...data, business_name: e.target.value })}
            placeholder="e.g., Joe's Coffee Shop"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Describe your campaign to attract customers..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Scratch Cards
        </label>
        <input
          type="number"
          value={data.total_cards || 100}
          onChange={(e) => onChange({ ...data, total_cards: parseInt(e.target.value) || 100 })}
          min="10"
          max="10000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          How many scratch cards to generate for this campaign
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-6 py-2 rounded-md font-medium ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next: Design
        </button>
      </div>
    </div>
  );
}

// Design Step Component
function DesignStep({ 
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
  const design = data.card_design || {
    background_color: '#1E3A8A',
    scratch_color: '#94A3B8',
    text_color: '#FFFFFF',
    accent_color: '#F59E0B',
    card_shape: 'rounded',
    animation_style: 'fade'
  };

  const updateDesign = (updates: Partial<typeof design>) => {
    onChange({
      ...data,
      card_design: { ...design, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Card Design Customization</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Design Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={design.background_color}
                onChange={(e) => updateDesign({ background_color: e.target.value })}
                className="w-full h-10 rounded-md border border-gray-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scratch Layer Color
              </label>
              <input
                type="color"
                value={design.scratch_color}
                onChange={(e) => updateDesign({ scratch_color: e.target.value })}
                className="w-full h-10 rounded-md border border-gray-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <input
                type="color"
                value={design.text_color}
                onChange={(e) => updateDesign({ text_color: e.target.value })}
                className="w-full h-10 rounded-md border border-gray-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <input
                type="color"
                value={design.accent_color}
                onChange={(e) => updateDesign({ accent_color: e.target.value })}
                className="w-full h-10 rounded-md border border-gray-300"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Shape
            </label>
            <select
              value={design.card_shape}
              onChange={(e) => updateDesign({ card_shape: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="circular">Circular</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation Style
            </label>
            <select
              value={design.animation_style}
              onChange={(e) => updateDesign({ animation_style: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>
        </div>
        
        {/* Live Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div 
              className={`w-64 h-40 mx-auto flex items-center justify-center text-center ${
                design.card_shape === 'rounded' ? 'rounded-lg' :
                design.card_shape === 'circular' ? 'rounded-full' : 'rounded-none'
              }`}
              style={{ 
                backgroundColor: design.background_color,
                color: design.text_color,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Scratch layer simulation */}
              <div 
                className="absolute inset-0 opacity-80"
                style={{ backgroundColor: design.scratch_color }}
              />
              
              {/* Content below scratch layer */}
              <div className="relative z-10 p-4">
                <div 
                  className="text-lg font-bold mb-2"
                  style={{ color: design.accent_color }}
                >
                  🎁 PRIZE!
                </div>
                <div className="text-sm">
                  {data.business_name || 'Your Business'}
                </div>
              </div>
              
              {/* Scratch instruction overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                <div className="text-white text-sm font-medium">
                  Scratch to reveal!
                </div>
              </div>
            </div>
          </div>
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
          Next: Prizes
        </button>
      </div>
    </div>
  );
}

// Export the main component
export default ScratchCampaignBuilder;