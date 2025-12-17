import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { Modal, Button, Input, Badge } from '../ui';
import Calendar from './Calendar';
import TimeSlots from './TimeSlots';
import { slotsApi, bookingsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { subscribe, getCollectionChannel, appwriteConfig } from '../../lib/appwrite';

export default function BookingModal({ resource, isOpen, onClose }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1); // 1: Select date/time, 2: Confirm

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch slots for selected date
  const { data: slots, isLoading: slotsLoading, refetch: refetchSlots } = useQuery({
    queryKey: ['slots', resource?.$id, dateStr],
    queryFn: () => slotsApi.getByResourceAndDate(resource.$id, dateStr),
    enabled: !!resource?.$id && !!selectedDate,
  });

  // Subscribe to realtime slot updates
  useEffect(() => {
    if (!resource?.$id) return;

    const channel = getCollectionChannel(appwriteConfig.collections.slots);
    const unsubscribe = subscribe(channel, (response) => {
      if (response.payload.resourceId === resource.$id) {
        refetchSlots();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [resource?.$id, refetchSlots]);

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: (bookingData) => bookingsApi.create(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onClose();
      // Reset state
      setSelectedSlot(null);
      setNotes('');
      setStep(1);
    },
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (!selectedSlot || !user) return;

    createBooking.mutate({
      userId: user.$id,
      userName: user.name,
      userEmail: user.email,
      resourceId: resource.$id,
      resourceName: resource.name,
      slotId: selectedSlot.$id,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes,
      totalPrice: selectedSlot.price || 0,
    });
  };

  const handleClose = () => {
    setSelectedSlot(null);
    setNotes('');
    setStep(1);
    onClose();
  };

  if (!resource) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Select Date & Time' : 'Confirm Booking'}
      description={resource.name}
      size="lg"
    >
      {step === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Resource Info + Calendar */}
          <div className="space-y-4">
            {/* Resource Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {resource.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {resource.name}
                  </h3>
                  {resource.location && (
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {resource.location}
                    </p>
                  )}
                  {resource.capacity && (
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Up to {resource.capacity} people
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Calendar */}
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
          </div>

          {/* Right: Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Available Times
              </h3>
              <Badge variant="info">
                {format(selectedDate, 'MMM d, yyyy')}
              </Badge>
            </div>

            <TimeSlots
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSlotSelect}
              loading={slotsLoading}
              emptyMessage="No slots available. Please select another date."
            />

            {/* Continue Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedSlot}
                className="w-full"
              >
                Continue to Confirm
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Booking Summary
            </h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Resource</span>
                <p className="font-medium text-gray-900 dark:text-white">{resource.name}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Location</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {resource.location || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date</span>
                <p className="font-medium text-gray-900 dark:text-white flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Time</span>
                <p className="font-medium text-gray-900 dark:text-white flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                  {format(new Date(selectedSlot.startTime), 'h:mm a')} - {format(new Date(selectedSlot.endTime), 'h:mm a')}
                </p>
              </div>
            </div>

            {selectedSlot.price > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Total Price</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${selectedSlot.price.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <Input
            label="Notes (optional)"
            placeholder="Add any special requests or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Error Message */}
          {createBooking.isError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{createBooking.error?.message || 'Failed to create booking. Please try again.'}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              loading={createBooking.isPending}
              className="flex-1"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
