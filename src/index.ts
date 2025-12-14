/**
 * UNBOUND - A desktop, local-first writer's cockpit
 * 
 * Main exports for the core content storage and management system
 */

// Core types
export * from './types/content';
export * from './types/storage';

// Core functionality
export { DocumentManager } from './core/documentManager';
export { LocalStorage } from './storage/localStorage';
export { TextNormalizer } from './normalization/textNormalizer';
export type { NormalizationOptions } from './normalization/textNormalizer';
