import { useState } from 'react';
import { Check } from 'lucide-react';

interface ProductSampleSelectorProps {
  selectedSample: string;
  onSelectSample: (sample: string) => void;
}

const samples = [
  { filename: 'sample1.dim_1200x800.jpg', label: 'Sample 1' },
  { filename: 'sample2.dim_1200x800.jpg', label: 'Sample 2' },
  { filename: 'sample3.dim_1200x800.jpg', label: 'Sample 3' },
  { filename: 'sample4.dim_1200x800.jpg', label: 'Sample 4' },
];

export default function ProductSampleSelector({ selectedSample, onSelectSample }: ProductSampleSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select a Sample Design</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {samples.map((sample) => (
          <button
            key={sample.filename}
            type="button"
            onClick={() => onSelectSample(sample.filename)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              selectedSample === sample.filename
                ? 'border-primary shadow-luxury scale-105'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <img
              src={`/assets/generated/${sample.filename}`}
              alt={sample.label}
              className="w-full h-auto aspect-[3/2] object-cover"
            />
            {selectedSample === sample.filename && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="bg-primary text-primary-foreground rounded-full p-2">
                  <Check className="h-6 w-6" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-white text-sm font-medium text-center">{sample.label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
