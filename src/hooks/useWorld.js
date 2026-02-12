import { useWorld as useWorldContext } from '../context/WorldContext';

/**
 * Re-export useWorld from WorldContext for convenience.
 */
export function useWorld() {
  return useWorldContext();
}
