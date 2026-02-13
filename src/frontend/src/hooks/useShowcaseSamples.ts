import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ShowcaseCategory, ShowcaseSamples, ShowcaseSampleUpdate } from '../backend';

export function useGetCategoryShowcaseSamples(category: ShowcaseCategory) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<ShowcaseSamples>({
    queryKey: ['showcaseSamples', category],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCategoryShowcaseSamples(category);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useUpdateShowcaseSamples(category: ShowcaseCategory) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ShowcaseSampleUpdate[]) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateShowcaseSamples(category, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcaseSamples', category] });
      queryClient.invalidateQueries({ queryKey: ['showcaseSamples'] });
    },
    onError: (error: any) => {
      console.error('Failed to update showcase samples:', error);
      throw new Error(error.message || 'Failed to update samples. Please try again.');
    },
  });
}

export interface ShowcaseSampleSlot {
  position: number;
  label: string;
  imageUrl: string | null;
  placeholderText: string;
}

export function useShowcaseSampleSlots(category: ShowcaseCategory): ShowcaseSampleSlot[] {
  const { data: showcaseSamples } = useGetCategoryShowcaseSamples(category);

  return Array.from({ length: 12 }, (_, i) => {
    const position = i + 1;
    const sample = showcaseSamples?.samples[i];
    const imageUrl = sample?.file?.getDirectURL() || null;

    return {
      position,
      label: `Sample ${position}`,
      imageUrl,
      placeholderText: 'No image uploaded yet',
    };
  });
}
