import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { AddToCartInput } from '../backend';

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerOrders'] });
      alert('Sample added to cart! Please proceed to payment.');
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      alert('Something went wrong!');
    },
  });
}

export function useGetCallerOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['callerOrders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return actor.getCallerOrders();
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}
