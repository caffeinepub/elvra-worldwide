import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface SubmitConfirmationEmailRequestInput {
  orderId: bigint;
  customerEmail: string;
  confirmationMessageTemplate: string;
}

export function useSubmitConfirmationEmailRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitConfirmationEmailRequestInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitConfirmationEmailRequest(
        input.orderId,
        input.customerEmail,
        input.confirmationMessageTemplate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmationEmailRequests'] });
    },
    onError: (error) => {
      console.error('Error submitting confirmation email request:', error);
    },
  });
}
