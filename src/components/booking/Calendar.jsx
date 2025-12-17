import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui';

export default function Calendar({ selectedDate, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDisabled = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day < today;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            disabled={isSameMonth(currentMonth, new Date())}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const dayIsToday = isToday(day);
          const disabled = isDisabled(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => !disabled && onSelectDate(day)}
              disabled={disabled}
              className={`
                relative p-2 text-sm rounded-lg transition-all duration-200
                ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : ''}
                ${disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                ${isSelected && !disabled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                ${dayIsToday && !isSelected ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}
                ${!isSelected && isCurrentMonth && !disabled ? 'text-gray-900 dark:text-gray-100' : ''}
              `}
            >
              {format(day, 'd')}
              {dayIsToday && (
                <span
                  className={`
                    absolute bottom-1 left-1/2 transform -translate-x-1/2
                    w-1 h-1 rounded-full
                    ${isSelected ? 'bg-white' : 'bg-indigo-600 dark:bg-indigo-400'}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Today Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentMonth(new Date());
            onSelectDate(new Date());
          }}
          className="w-full"
        >
          Today
        </Button>
      </div>
    </div>
  );
}
