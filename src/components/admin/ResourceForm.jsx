import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button, Input, Select } from '../ui';

const resourceTypes = [
  { value: 'meeting-room', label: 'Meeting Room' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'service', label: 'Service' },
];

export default function ResourceForm({ onSubmit, initialData = {}, loading }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    type: initialData.type || 'meeting-room',
    location: initialData.location || '',
    capacity: initialData.capacity || 1,
    imageUrl: initialData.imageUrl || '',
    pricePerHour: initialData.pricePerHour || 0,
    amenities: initialData.amenities || [],
  });

  const [amenityInput, setAmenityInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Resource Name"
        name="name"
        placeholder="e.g., Conference Room A"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Describe the resource..."
          value={formData.description}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={resourceTypes}
        />

        <Input
          label="Capacity"
          name="capacity"
          type="number"
          min={1}
          max={1000}
          value={formData.capacity}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Location"
          name="location"
          placeholder="e.g., Building A, Floor 2"
          value={formData.location}
          onChange={handleChange}
        />

        <Input
          label="Price per Hour ($)"
          name="pricePerHour"
          type="number"
          min={0}
          step={0.01}
          value={formData.pricePerHour}
          onChange={handleChange}
        />
      </div>

      <Input
        label="Image URL"
        name="imageUrl"
        placeholder="https://example.com/image.jpg"
        value={formData.imageUrl}
        onChange={handleChange}
      />

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Amenities
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Wi-Fi, Projector"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
          />
          <Button type="button" onClick={handleAddAmenity} variant="secondary">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {formData.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button type="submit" loading={loading} className="w-full">
          {initialData.$id ? 'Update Resource' : 'Create Resource'}
        </Button>
      </div>
    </form>
  );
}
