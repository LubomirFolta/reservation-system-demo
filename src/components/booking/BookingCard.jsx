import { format, isPast } from 'date-fns';
import { Calendar, Clock, MapPin, XCircle } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export default function BookingCard({ booking, onCancel, showActions = true }) {
  const isPastBooking = isPast(new Date(booking.endTime));

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
      completed: 'info',
    };
    return variants[status] || 'default';
  };

  const formatDateTime = (isoString) => {
    return format(new Date(isoString), 'h:mm a');
  };

  const formatDate = (isoString) => {
    return format(new Date(isoString), 'EEE, MMM d, yyyy');
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {booking.resourceName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusBadge(booking.status)} size="sm">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
              {isPastBooking && booking.status === 'confirmed' && (
                <Badge variant="default" size="sm">Past</Badge>
              )}
            </div>
          </div>
          {booking.totalPrice > 0 && (
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                ${booking.totalPrice.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {formatDate(booking.startTime)}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
          </div>
        </div>

        {booking.notes && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            {booking.notes}
          </p>
        )}

        {showActions && booking.status === 'confirmed' && !isPastBooking && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(booking.$id)}
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
