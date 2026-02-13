import { type ReactNode, useState } from 'react';

interface ServiceCardProps {
  icon?: string;
  name: string;
  priceLabel: string;
  deliveryTime: string;
  action?: ReactNode;
}

export default function ServiceCard({ icon, name, priceLabel, deliveryTime, action }: ServiceCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="service-card">
      {icon && !imageError && (
        <img 
          src={icon} 
          alt={name}
          onError={() => setImageError(true)}
        />
      )}
      <p className="price">
        {priceLabel}
      </p>
      <h3>{name}</h3>
      <p className="delivery">{deliveryTime}</p>
      {action}
    </div>
  );
}
