import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle } from 'lucide-react';
import { InlineSpinner, Button } from '../components/ui';
import { BookingCard } from '../components/booking';
import { bookingsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { subscribe, getCollectionChannel, appwriteConfig } from '../lib/appwrite';

export default function MyBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's bookings
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['bookings', 'user', user?.$id],
    queryFn: () => bookingsApi.getByUser(user.$id),
    enabled: !!user?.$id,
  });

  // Subscribe to realtime booking updates
  useEffect(() => {
    if (!user?.$id) return;

    const channel = getCollectionChannel(appwriteConfig.collections.bookings);
    const unsubscribe = subscribe(channel, (response) => {
      if (response.payload.userId === user.$id) {
        refetch();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.$id, refetch]);

  // Cancel booking mutation
  const cancelBooking = useMutation({
    mutationFn: (bookingId) => bookingsApi.cancel(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking.mutate(bookingId);
    }
  };

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings?.filter(b =>
    new Date(b.endTime) > now && b.status === 'confirmed'
  ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) || [];

  const pastBookings = bookings?.filter(b =>
    new Date(b.endTime) <= now || b.status !== 'confirmed'
  ).sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Bookings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View and manage your reservations
        </p>
      </div>

      {isLoading ? (
        <InlineSpinner text="Loading your bookings..." />
      ) : !bookings || bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven't made any reservations yet
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Browse Resources
          </Button>
        </div>
      ) : (
        <>
          {/* Upcoming Bookings */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming ({upcomingBookings.length})
            </h2>
            {upcomingBookings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                No upcoming bookings
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.$id}
                    booking={booking}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Past & Cancelled Bookings */}
          {pastBookings.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Past & Cancelled ({pastBookings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking.$id}
                    booking={booking}
                    showActions={false}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
