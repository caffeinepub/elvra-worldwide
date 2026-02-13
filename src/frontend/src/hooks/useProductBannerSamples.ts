import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ShowcaseCategory, ShowcaseSamples, ShowcaseSampleUpdate, ShowcaseSample } from '../backend';

export function useGetProductBannerSamples() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<ShowcaseSamples>({
    queryKey: ['showcaseSamples', ShowcaseCategory.productBanner],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCategoryShowcaseSamples(ShowcaseCategory.productBanner);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useUpdateProductBannerSamples() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ShowcaseSampleUpdate[]) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateShowcaseSamples(ShowcaseCategory.productBanner, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcaseSamples', ShowcaseCategory.productBanner] });
      queryClient.invalidateQueries({ queryKey: ['showcaseSamples'] });
    },
    onError: (error: any) => {
      console.error('Failed to update product banner samples:', error);
      throw new Error(error.message || 'Failed to update samples. Please try again.');
    },
  });
}

export interface SampleSlot {
  position: number;
  label: string;
  backendSample?: ShowcaseSample;
  fallbackUrl: string;
  identifier: string;
}

export function useSampleSlots(): SampleSlot[] {
  const { data: showcaseSamples } = useGetProductBannerSamples();

  return [
    {
      position: 1,
      label: 'Sample 1',
      backendSample: showcaseSamples?.samples[0] || undefined,
      fallbackUrl: '/assets/generated/sample1.dim_1200x800.jpg',
      identifier: 'sample1',
    },
    {
      position: 2,
      label: 'Sample 2',
      backendSample: showcaseSamples?.samples[1] || undefined,
      fallbackUrl: '/assets/generated/sample2.dim_1200x800.jpg',
      identifier: 'sample2',
    },
    {
      position: 3,
      label: 'Sample 3',
      backendSample: showcaseSamples?.samples[2] || undefined,
      fallbackUrl: '/assets/generated/sample3.dim_1200x800.jpg',
      identifier: 'sample3',
    },
    {
      position: 4,
      label: 'Sample 4',
      backendSample: showcaseSamples?.samples[3] || undefined,
      fallbackUrl: '',
      identifier: 'sample4',
    },
  ];
}
