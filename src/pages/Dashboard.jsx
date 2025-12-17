import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input, Button, InlineSpinner, Select } from '../components/ui';
import { ResourceCard, BookingModal } from '../components/booking';
import { resourcesApi } from '../services/api';
import { subscribe, getCollectionChannel, appwriteConfig } from '../lib/appwrite';

const resourceTypes = [
  { value: '', label: 'All Types' },
  { value: 'meeting-room', label: 'Meeting Rooms' },
  { value: 'workspace', label: 'Workspaces' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'service', label: 'Services' },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Fetch resources
  const { data: resources, isLoading, refetch } = useQuery({
    queryKey: ['resources'],
    queryFn: resourcesApi.getAll,
  });

  // Subscribe to realtime resource updates
  useEffect(() => {
    const channel = getCollectionChannel(appwriteConfig.collections.resources);
    const unsubscribe = subscribe(channel, () => {
      refetch();
    });

    return () => {
      unsubscribe();
    };
  }, [refetch]);

  // Filter resources
  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || resource.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const handleBook = (resource) => {
    setSelectedResource(resource);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Available Resources
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Browse and book available resources
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search resources..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={resourceTypes}
            placeholder="Filter by type"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <InlineSpinner text="Loading resources..." />
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No resources found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || filterType
              ? 'Try adjusting your search or filters'
              : 'No resources have been added yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.$id}
              resource={resource}
              onBook={handleBook}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        resource={selectedResource}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedResource(null);
        }}
      />
    </div>
  );
}
