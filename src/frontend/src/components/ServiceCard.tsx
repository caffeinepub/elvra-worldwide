import { type ReactNode } from 'react';

interface ServiceCardProps {
  icon?: string;
  name: string;
  priceRange: string;
  deliveryTime: string;
  action?: ReactNode;
}

export default function ServiceCard({ icon, name, priceRange, deliveryTime, action }: ServiceCardProps) {
  return (
    <div className="group relative bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-luxury">
      {icon && (
        <div className="mb-4 flex justify-center">
          <img 
            src={icon} 
            alt={name} 
            className="h-16 w-16 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}
      <h3 className="text-xl font-serif font-bold mb-3 text-center">{name}</h3>
      <div className="space-y-2 mb-4">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-semibold text-primary">{priceRange}</span>
        </p>
        <p className="text-sm text-muted-foreground text-center">{deliveryTime}</p>
      </div>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

