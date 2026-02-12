import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useUpdateOrderPaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderPaymentStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerOrders'] });
    },
    onError: (error) => {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status. Please try again.');
    },
  });
}
