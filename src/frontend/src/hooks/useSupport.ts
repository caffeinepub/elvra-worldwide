import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SupportRequest } from '../backend';

export function useSubmitSupportRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email, message }: { name: string; email: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitSupportRequest(name, email, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportRequests'] });
    },
  });
}

export function useGetSupportRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SupportRequest[]>({
    queryKey: ['supportRequests'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return actor.getSupportRequests();
      } catch (error) {
        // If unauthorized, return empty array
        console.error('Error fetching support requests:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

