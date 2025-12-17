import { format } from 'date-fns';
import { Clock, Check } from 'lucide-react';
import { InlineSpinner } from '../ui';

export default function TimeSlots({
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
  emptyMessage = 'No time slots available for this date',
}) {
  if (loading) {
    return <InlineSpinner text="Loading available slots..." />;
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const formatTime = (isoString) => {
    return format(new Date(isoString), 'h:mm a');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.$id === slot.$id;
        const isAvailable = slot.isAvailable;

        return (
          <button
            key={slot.$id}
            onClick={() => isAvailable && onSelectSlot(slot)}
            disabled={!isAvailable}
            className={`
              relative px-4 py-3 rounded-lg border-2 transition-all duration-200
              ${isAvailable
                ? isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className={`text-sm font-medium ${
                  isSelected
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : isAvailable
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {formatTime(slot.startTime)}
                </div>
                <div className={`text-xs ${
                  isSelected
                    ? 'text-indigo-500 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatTime(slot.endTime)}
                </div>
              </div>
              {isSelected && (
                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            {slot.price > 0 && isAvailable && (
              <div className={`mt-1 text-xs font-medium ${
                isSelected
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                ${slot.price.toFixed(2)}
              </div>
            )}
            {!isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded">
                  Booked
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
