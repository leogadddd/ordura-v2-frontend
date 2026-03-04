import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/DataGrid";
import { Button } from "@/components/ui/Button";
import { Page, PageHeader } from "@/components/layout/Page";
import { LocationFormModal } from "@/components/modals/LocationFormModal";
import { useLocations, useDeleteLocation } from "@/hooks/useInventory";
import { showToast } from "@/lib/toast";
import type { Location } from "@/api/inventoryApi";

export function LocationsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationsData, setLocationsData] = useState<Location[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>(
    undefined,
  );

  const deleteLocationMutation = useDeleteLocation();
  const locationsQuery = useLocations();

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await locationsQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (locationsQuery.data) setLocationsData(locationsQuery.data);
  }, [locationsQuery.data]);

  const handleEditLocation = (loc: Location) => {
    setEditingLocation(loc);
    setShowLocationModal(true);
  };

  const handleDeleteLocation = async (loc: Location) => {
    try {
      await deleteLocationMutation.mutateAsync(loc.id);
      showToast.success("Location deleted");
    } catch (err: any) {
      console.error(err);
      showToast.error("Failed to delete location");
    }
  };

  const locationColumns: ColDef<Location>[] = [
    { headerName: "Name", field: "name" as keyof Location, flex: 1 },
    { headerName: "Address", field: "address" as keyof Location, flex: 1 },
    {
      headerName: "Actions",
      field: "actions" as any,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditLocation(params.data)}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteLocation(params.data)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: 100,
    },
  ];

  return (
    <Page className="gap-4">
      <PageHeader
        title="Locations"
        subtitle="Manage your inventory locations."
        actions={
          <Button
            onClick={() => {
              setEditingLocation(undefined);
              setShowLocationModal(true);
            }}
            variant="primary"
            size="md"
          >
            <PlusIcon className="w-4 h-4" />
            New location
          </Button>
        }
      />

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1">
          <DataGrid<Location>
            rowData={locationsData}
            columnDefs={locationColumns}
            loading={locationsQuery.isLoading || isRefreshing}
            noRowsMessage="No locations defined."
            height="100%"
            rowSelection={{ mode: "singleRow" }}
          />
        </div>
      </div>

      <LocationFormModal
        isOpen={showLocationModal}
        location={editingLocation}
        onClose={() => {
          setShowLocationModal(false);
          refresh();
        }}
      />
    </Page>
  );
}

export default LocationsPage;
