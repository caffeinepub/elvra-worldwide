import { Check } from 'lucide-react';
import { useSampleSlots } from '../hooks/useProductBannerSamples';

interface ProductSampleSelectorProps {
  selectedSample: string;
  onSelectSample: (sample: string) => void;
}

export default function ProductSampleSelector({ selectedSample, onSelectSample }: ProductSampleSelectorProps) {
  const sampleSlots = useSampleSlots();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select a Sample Design</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sampleSlots.map((slot) => {
          const imageUrl = slot.backendSample?.file?.getDirectURL() || slot.fallbackUrl;
          
          return (
            <button
              key={slot.identifier}
              type="button"
              onClick={() => onSelectSample(slot.identifier)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedSample === slot.identifier
                  ? 'border-primary shadow-luxury scale-105'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <img
                src={imageUrl}
                alt={slot.label}
                className="w-full h-auto aspect-[3/2] object-cover"
              />
              {selectedSample === slot.identifier && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-sm font-medium text-center">{slot.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
