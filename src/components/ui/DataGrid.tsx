import { useMemo, type CSSProperties } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, RowSelectionOptions } from "ag-grid-community";

type CSSVarProperties = Record<`--${string}`, string | number>;

interface DataGridProps<T> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  defaultColDef?: Omit<ColDef<T>, "field">;
  height?: string | number;
  loading?: boolean;
  noRowsMessage?: string;
  className?: string;
  rowSelection?: RowSelectionOptions;
  onSelectionChanged?: (selectedRows: T[]) => void;
}

export function DataGrid<T>({
  rowData,
  columnDefs,
  defaultColDef,
  height = "100%",
  loading = false,
  noRowsMessage = "No records found",
  className = "",
  rowSelection,
  onSelectionChanged,
}: DataGridProps<T>) {
  const gridStyle = useMemo(
    () =>
      ({
        height,
        "--ag-header-background-color": "#004d61",
        "--ag-header-foreground-color": "#ffffff",
        "--ag-header-grid-color": "#003544",
        "--ag-tool-panel-header-background-color": "#004d61",
        "--ag-tool-panel-header-foreground-color": "#ffffff",
      } satisfies CSSProperties & CSSVarProperties),
    [height]
  );

  const baseColDef: ColDef<T> = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 140,
      ...defaultColDef,
    }),
    [defaultColDef]
  );

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      )}
      <div className="ag-theme-quartz h-full w-full" style={gridStyle}>
        <AgGridReact<T>
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={baseColDef}
          animateRows
          overlayNoRowsTemplate={`<span class="ag-overlay-no-rows-center">${noRowsMessage}</span>`}
          suppressCellFocus={true}
          rowSelection={rowSelection}
          onSelectionChanged={
            onSelectionChanged
              ? (event) => {
                  const selectedRows = event.api.getSelectedRows();
                  onSelectionChanged(selectedRows);
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}

export default DataGrid;
