import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { OrderStatus } from '../backend';

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVerifyPaymentAndConfirmOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyPaymentAndConfirmOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['ordersByStatus'] });
      queryClient.invalidateQueries({ queryKey: ['allNotificationRequests'] });
    },
    onError: (error) => {
      console.error('Error verifying payment and confirming order:', error);
      throw new Error('Failed to verify payment and confirm order. Please try again.');
    },
  });
}

export function useGetOrdersByStatus(status: OrderStatus) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['ordersByStatus', status],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOrdersByStatus(status);
      } catch (error) {
        console.error('Error fetching orders by status:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllNotificationRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allNotificationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllNotificationRequests();
      } catch (error) {
        console.error('Error fetching notification requests:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}
