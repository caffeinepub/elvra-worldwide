import { ShowcaseCategory } from '../backend';
import { useShowcaseSampleSlots } from '../hooks/useShowcaseSamples';
import { Card } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface ExploreWorkSamplesGalleryProps {
  category: ShowcaseCategory;
  title?: string;
}

export default function ExploreWorkSamplesGallery({ category, title = 'Explore Our Work' }: ExploreWorkSamplesGalleryProps) {
  const sampleSlots = useShowcaseSampleSlots(category);

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground">
          Browse our collection of sample designs to inspire your next project.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sampleSlots.map((slot) => (
          <Card key={slot.position} className="overflow-hidden border border-border shadow-md hover:shadow-lg transition-shadow">
            <div className="aspect-[3/2] relative bg-muted">
              {slot.imageUrl ? (
                <img
                  src={slot.imageUrl}
                  alt={slot.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                  <p className="text-sm text-center px-2">{slot.placeholderText}</p>
                </div>
              )}
            </div>
            <div className="p-3 bg-card">
              <p className="text-sm font-medium text-center">{slot.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
