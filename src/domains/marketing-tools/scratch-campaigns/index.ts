/**
 * Scratch-and-Win Campaigns Module Exports
 * Main entry point for the scratch campaigns functionality
 */

// Types
export * from './types';

// Services
export { scratchCampaignService } from './service';

// Components
export { default as ScratchCampaignBuilder } from './components/ScratchCampaignBuilder';
export { default as ScratchGame } from './components/ScratchGame';
export { default as ScratchCampaignsDashboard } from './components/ScratchCampaignsDashboard';
export { PrizesStep, SettingsStep, PreviewStep } from './components/CampaignBuilderSteps';