import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Service } from '../backend';

export function useServices() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServices();
    },
    enabled: !!actor && !actorFetching,
  });
}

