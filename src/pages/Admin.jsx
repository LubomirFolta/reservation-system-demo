import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Settings,
  Calendar,
  LayoutGrid,
  Trash2,
  Edit,
  Clock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  Badge,
  InlineSpinner,
} from '../components/ui';
import { ResourceForm, SlotGenerator, BookingsTable } from '../components/admin';
import { resourcesApi, slotsApi, bookingsApi, parseAmenities } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { subscribe, getCollectionChannel, appwriteConfig } from '../lib/appwrite';

export default function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('resources');
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [selectedResourceForSlots, setSelectedResourceForSlots] = useState(null);

  // Fetch resources
  const { data: resources, isLoading: resourcesLoading, refetch: refetchResources } = useQuery({
    queryKey: ['resources', 'admin'],
    queryFn: resourcesApi.getAllAdmin,
  });

  // Fetch all bookings
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['bookings', 'admin'],
    queryFn: bookingsApi.getAll,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const resourcesChannel = getCollectionChannel(appwriteConfig.collections.resources);
    const bookingsChannel = getCollectionChannel(appwriteConfig.collections.bookings);

    const unsubResources = subscribe(resourcesChannel, () => refetchResources());
    const unsubBookings = subscribe(bookingsChannel, () => refetchBookings());

    return () => {
      unsubResources();
      unsubBookings();
    };
  }, [refetchResources, refetchBookings]);

  // Create resource mutation
  const createResource = useMutation({
    mutationFn: (data) => resourcesApi.create(data, user.$id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setIsResourceModalOpen(false);
    },
  });

  // Update resource mutation
  const updateResource = useMutation({
    mutationFn: ({ id, data }) => resourcesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setIsResourceModalOpen(false);
      setEditingResource(null);
    },
  });

  // Toggle resource active status
  const toggleResourceActive = useMutation({
    mutationFn: ({ id, isActive }) => resourcesApi.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  // Delete resource mutation
  const deleteResource = useMutation({
    mutationFn: resourcesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  // Create slots mutation
  const createSlots = useMutation({
    mutationFn: slotsApi.createBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      setIsSlotModalOpen(false);
      setSelectedResourceForSlots(null);
    },
  });

  // Update booking status mutation
  const updateBookingStatus = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });

  const handleResourceSubmit = (data) => {
    if (editingResource) {
      updateResource.mutate({ id: editingResource.$id, data });
    } else {
      createResource.mutate(data);
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource({
      ...resource,
      amenities: parseAmenities(resource.amenities),
    });
    setIsResourceModalOpen(true);
  };

  const handleDeleteResource = (id) => {
    if (window.confirm('Are you sure you want to delete this resource? This will also delete all associated slots.')) {
      deleteResource.mutate(id);
    }
  };

  const handleGenerateSlots = (resourceId) => {
    setSelectedResourceForSlots(resourceId);
    setIsSlotModalOpen(true);
  };

  const tabs = [
    { id: 'resources', label: 'Resources', icon: LayoutGrid },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage resources and bookings
          </p>
        </div>
        {activeTab === 'resources' && (
          <Button onClick={() => {
            setEditingResource(null);
            setIsResourceModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div>
          {resourcesLoading ? (
            <InlineSpinner text="Loading resources..." />
          ) : !resources || resources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <LayoutGrid className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No resources yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create your first resource to get started
                </p>
                <Button onClick={() => setIsResourceModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <Card key={resource.$id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {resource.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {resource.name}
                            </h3>
                            <Badge variant={resource.isActive ? 'success' : 'danger'} size="sm">
                              {resource.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {resource.type} {resource.location && `• ${resource.location}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleResourceActive.mutate({
                            id: resource.$id,
                            isActive: !resource.isActive,
                          })}
                          title={resource.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {resource.isActive ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateSlots(resource.$id)}
                          title="Generate Slots"
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditResource(resource)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResource(resource.$id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {bookingsLoading ? (
              <div className="p-6">
                <InlineSpinner text="Loading bookings..." />
              </div>
            ) : (
              <BookingsTable
                bookings={bookings}
                onUpdateStatus={(id, status) => updateBookingStatus.mutate({ id, status })}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Resource Modal */}
      <Modal
        isOpen={isResourceModalOpen}
        onClose={() => {
          setIsResourceModalOpen(false);
          setEditingResource(null);
        }}
        title={editingResource ? 'Edit Resource' : 'Create Resource'}
        description={editingResource ? 'Update resource details' : 'Add a new bookable resource'}
        size="lg"
      >
        <ResourceForm
          onSubmit={handleResourceSubmit}
          initialData={editingResource || {}}
          loading={createResource.isPending || updateResource.isPending}
        />
      </Modal>

      {/* Slot Generator Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setSelectedResourceForSlots(null);
        }}
        title="Generate Time Slots"
        description="Create available booking slots for this resource"
        size="md"
      >
        <SlotGenerator
          resourceId={selectedResourceForSlots}
          onGenerate={(slots) => createSlots.mutate(slots)}
          loading={createSlots.isPending}
        />
      </Modal>
    </div>
  );
}
