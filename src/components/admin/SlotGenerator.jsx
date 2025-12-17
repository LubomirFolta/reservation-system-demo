import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import { generateTimeSlots } from '../../services/api';

export default function SlotGenerator({ resourceId, onGenerate, loading }) {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [interval, setInterval] = useState(60);
  const [price, setPrice] = useState(0);

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: format(new Date().setHours(i, 0), 'h:mm a'),
  }));

  const intervalOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ];

  const handleGenerate = () => {
    const slots = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const daySlots = generateTimeSlots(
        resourceId,
        currentDate,
        startHour,
        endHour,
        interval,
        price
      );
      slots.push(...daySlots);
      currentDate = addDays(currentDate, 1);
    }

    onGenerate(slots);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Start Hour"
          value={startHour}
          onChange={(e) => setStartHour(parseInt(e.target.value))}
          options={hourOptions}
        />
        <Select
          label="End Hour"
          value={endHour}
          onChange={(e) => setEndHour(parseInt(e.target.value))}
          options={hourOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Slot Duration"
          value={interval}
          onChange={(e) => setInterval(parseInt(e.target.value))}
          options={intervalOptions}
        />
        <Input
          label="Price per Slot ($)"
          type="number"
          min={0}
          step={0.01}
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="pt-4">
        <Button onClick={handleGenerate} loading={loading} className="w-full">
          Generate Time Slots
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        This will create available time slots for the selected date range.
      </p>
    </div>
  );
}
