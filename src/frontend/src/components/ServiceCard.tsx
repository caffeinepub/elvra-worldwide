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
    <div className="service-card">
      {icon && (
        <img 
          src={icon} 
          alt={name}
        />
      )}
      <h3>{name}</h3>
      <p className="price">
        {priceRange}
      </p>
      <p className="delivery">{deliveryTime}</p>
      {action}
    </div>
  );
}
