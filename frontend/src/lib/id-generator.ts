/**
 * Generate unique IDs for client-side entities
 * Uses a counter + timestamp to ensure uniqueness
 */
let idCounter = 0;

export function generateTempId(): number {
  // Use negative numbers for temporary IDs (will be replaced by backend)
  // This ensures they don't conflict with real IDs
  idCounter++;
  return -(Date.now() + idCounter);
}

