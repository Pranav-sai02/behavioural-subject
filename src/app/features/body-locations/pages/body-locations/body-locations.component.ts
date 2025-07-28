import { Component, OnInit } from '@angular/core';
import { GridApi, ColDef, GetContextMenuItems, GetContextMenuItemsParams, MenuItemDef, CellClickedEvent } from 'ag-grid-community';
import { Store } from '@ngxs/store';
import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { BodyLocations } from '../../models/BodyLocations';
import {
  LoadBodyLocations,
  UpdateBodyLocation,
  SoftDeleteBodyLocation,
  AddBodyLocationRowLocally,
} from '../../state/body-locations.actions';
import { BodyLocationsState } from '../../state/body-locations.state';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { SaveButtonRendererComponent } from '../../../../shared/component/save-button-renderer/save-button-renderer.component';

@Component({
  selector: 'app-body-locations',
  standalone: false,
  templateUrl: './body-locations.component.html',
  styleUrl: './body-locations.component.css',
})
export class BodyLocationsComponent implements OnInit {
  ActiveToggleRendererComponent = ActiveToggleRendererComponent;
  SoftDeleteRendererComponent = SoftDeleteButtonRendererComponent;
   SaveButtonRendererComponent = SaveButtonRendererComponent;
  

  gridApi!: GridApi;
  rowData: BodyLocations[] = [];

  columnDefs: ColDef<BodyLocations>[] = [
    {
      field: 'BodyLocationCode',
      headerName: 'Body Location Code',
      flex: 1,
      minWidth: 150,
      editable: true,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'Description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      editable: true,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'IsActive',
      headerName: 'Active',
      flex: 1,
      minWidth: 150,
      cellRenderer: 'activeToggleRenderer',
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      suppressHeaderMenuButton:true,
      pinned: 'right',
      sortable: false,
      filter: false,
      flex: 1,
      maxWidth: 90,
      cellRenderer: 'saveButtonRenderer',
      onCellClicked: (params:CellClickedEvent) => {
        if (params?.data) {
          this.saveRow(params.data);
        }
      },
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      suppressHeaderMenuButton:true,
      pinned: 'right',
      sortable: false,
      filter: false,
      flex: 1,
      maxWidth: 100,
      cellRenderer: 'softDeleteRenderer',
      onCellClicked: (params: CellClickedEvent) => this.softDelete(params.data),
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: true,
  };

  constructor(
    private store: Store,
    private toaster: ToastrService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(new LoadBodyLocations()).subscribe({
      error: (err) => {
        this.logger.logError(err, 'BodyLocationsComponent.ngOnInit');
        this.toaster.show('Failed to load body locations', 'error');
      },
    });

    this.store.select(BodyLocationsState.getBodyLocations).subscribe({
      next: (data) => (this.rowData = data),
    });
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  onCellValueChanged(event: any): void {
    const row = event.data;
    row.IsEdited = true;
    this.gridApi.applyTransaction({ update: [row] });
  }

  saveRow(row: BodyLocations): void {
    const isNew = row.BodyLocationId === 0;
    const trimmed = {
      Description: row.Description?.trim(),
      IsActive: row.IsActive,
    };

    if (!isNew && !row.IsEdited) {
      this.toaster.show('No changes to save.', 'info');
      return;
    }

    const payload = { ...row, ...trimmed };

    this.store.dispatch(new UpdateBodyLocation(row.BodyLocationId, payload)).subscribe({
      next: () => {
        this.toaster.show('Saved successfully', 'success');
        row.IsEdited = false;
        this.gridApi.applyTransaction({ update: [row] });
      },
      error: (err) => {
        this.toaster.show('Failed to save', 'error');
        this.logger.logError(err, 'BodyLocationsComponent.saveRow');
      },
    });
  }

  softDelete(row: BodyLocations): void {
    const updated = { ...row, IsDelete: true };
    this.store.dispatch(new SoftDeleteBodyLocation(updated)).subscribe({
      next: () =>
        this.toaster.show('Deleted successfully', 'success', 'success', 3000),
      error: (err) => {
        this.toaster.show('Failed to delete', 'error', 'error', 5000);
        this.logger.logError(err, 'BodyLocationsComponent.softDelete');
      },
    });
  }

  addRow(): void {
    const newRow: BodyLocations = {
      BodyLocationId: 0,
      BodyLocationCode: '',
      Description: '',
      IsActive: true,
      IsDelete: false,
      IsEdited: true,
    };
    this.store.dispatch(new AddBodyLocationRowLocally(newRow));
  }

  getContextMenuItems: GetContextMenuItems = (
    params: GetContextMenuItemsParams
  ) => {
    const addRow: MenuItemDef = {
      name: 'Add Row',
      action: () => this.addRow(),
      icon: '<i class="fas fa-plus"></i>',
    };

    const deleteRow: MenuItemDef = {
      name: 'Delete Row',
      action: () => {
        if (params.node) {
          this.softDelete(params.node.data);
        }
      },
      icon: '<i class="fas fa-trash"></i>',
    };

    return [addRow, deleteRow, 'separator', 'copy', 'export'];
  };

  getRowClass = (params: any) => (!params.data.BodyLocationId ? 'temporary-row' : '');
}
