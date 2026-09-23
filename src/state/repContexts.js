import { createContext } from 'react';

/**
 * Contexts live in their own module so the provider file exports only a
 * component. That keeps Fast Refresh working during development.
 */
export const RepStateContext = createContext(null);
export const RepDispatchContext = createContext(null);
