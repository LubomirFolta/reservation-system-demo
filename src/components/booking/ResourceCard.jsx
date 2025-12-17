import { MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { parseAmenities } from '../../services/api';

export default function ResourceCard({ resource, onBook }) {
  const amenities = parseAmenities(resource.amenities);

  const getTypeColor = (type) => {
    const colors = {
      'meeting-room': 'primary',
      'workspace': 'info',
      'equipment': 'warning',
      'service': 'success',
    };
    return colors[type] || 'default';
  };

  const formatType = (type) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card hover className="overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/80 text-6xl font-bold">
              {resource.name.charAt(0)}
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={getTypeColor(resource.type)}>
            {formatType(resource.type)}
          </Badge>
        </div>
        {resource.pricePerHour > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
            ${resource.pricePerHour}/hr
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {resource.name}
        </h3>

        {resource.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          {resource.location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {resource.location}
            </div>
          )}
          {resource.capacity && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              Up to {resource.capacity} people
            </div>
          )}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenities.slice(0, 4).map((amenity, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {amenities.length > 4 && (
              <span className="text-xs px-2 py-1 text-gray-500 dark:text-gray-500">
                +{amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Book Button */}
        <Button
          onClick={() => onBook(resource)}
          className="w-full"
          variant="primary"
        >
          View Availability
        </Button>
      </div>
    </Card>
  );
}
