import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { Badge, Button } from '../ui';

export default function BookingsTable({ bookings, onUpdateStatus }) {
  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
      completed: 'info',
    };
    return variants[status] || 'default';
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Resource
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Price
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {bookings.map((booking) => (
            <tr
              key={booking.$id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900 dark:text-white">
                  {booking.resourceName}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {booking.userName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {booking.userEmail}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(booking.startTime), 'MMM d, yyyy')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(booking.startTime), 'h:mm a')} -{' '}
                  {format(new Date(booking.endTime), 'h:mm a')}
                </div>
              </td>
              <td className="py-4 px-4">
                <Badge variant={getStatusBadge(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </td>
              <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                {booking.totalPrice > 0 ? `$${booking.totalPrice.toFixed(2)}` : 'Free'}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateStatus(booking.$id, 'confirmed')}
                        title="Approve"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateStatus(booking.$id, 'cancelled')}
                        title="Reject"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateStatus(booking.$id, 'cancelled')}
                      title="Cancel"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
