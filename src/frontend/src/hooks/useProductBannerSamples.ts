import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ProductBanners, ProductBannerSample, ProductBannerSampleUpdate, ExternalBlob } from '../backend';

export function useGetProductBannerSamples() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<ProductBanners>({
    queryKey: ['productBannerSamples'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProductBannerSamples();
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
    mutationFn: async (updates: ProductBannerSampleUpdate[]) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProductBannerSamples(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productBannerSamples'] });
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
  backendSample?: ProductBannerSample;
  fallbackUrl: string;
  identifier: string;
}

export function useSampleSlots(): SampleSlot[] {
  const { data: banners } = useGetProductBannerSamples();

  return [
    {
      position: 1,
      label: 'Sample 1',
      backendSample: banners?.sample1,
      fallbackUrl: '/assets/generated/sample1.dim_1200x800.jpg',
      identifier: 'sample1',
    },
    {
      position: 2,
      label: 'Sample 2',
      backendSample: banners?.sample2,
      fallbackUrl: '/assets/generated/sample2.dim_1200x800.jpg',
      identifier: 'sample2',
    },
    {
      position: 3,
      label: 'Sample 3',
      backendSample: banners?.sample3,
      fallbackUrl: '/assets/generated/sample3.dim_1200x800.jpg',
      identifier: 'sample3',
    },
    {
      position: 4,
      label: 'Sample 4',
      backendSample: banners?.sample4,
      fallbackUrl: '/assets/generated/sample4.dim_1200x800.jpg',
      identifier: 'sample4',
    },
  ];
}
