import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { AddToCartInput } from '../backend';

interface UseAddToCartOptions {
  onSuccess?: (orderId: bigint) => void;
}

export function useAddToCart(options?: UseAddToCartOptions) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      if (!actor) throw new Error('Actor not available');
      const orderId = await actor.addToCart(input);
      
      // Defensive check: ensure orderId is valid
      if (!orderId || orderId === BigInt(0)) {
        console.error('Invalid orderId returned from backend:', orderId);
        throw new Error('Invalid order ID returned from backend');
      }
      
      return orderId;
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: ['callerOrders'] });
      if (options?.onSuccess) {
        options.onSuccess(orderId);
      }
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
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
