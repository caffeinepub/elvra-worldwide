import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useConfirmationMessageTemplate() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['confirmationMessageTemplate'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getConfirmationMessageTemplate();
    },
    enabled: !!actor && !actorFetching,
  });
}
