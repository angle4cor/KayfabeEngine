import { useWorld } from './useWorld';

/**
 * Career state for current player: wrestlers owned, booker fed, role.
 * Phase 5 will expand.
 */
export function useMyCareer() {
  const world = useWorld();
  return {
    role: world.player?.role ?? null,
    wrestlerIds: world.player?.wrestlerIds ?? [],
    bookerFedId: world.player?.bookerFedId ?? null,
  };
}
