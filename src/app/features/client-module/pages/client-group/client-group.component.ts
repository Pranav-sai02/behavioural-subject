import { Component } from '@angular/core';
import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import {
  CellClickedEvent,
  CellValueChangedEvent,
  ColDef,
  GetContextMenuItems,
  GetContextMenuItemsParams,
  GridApi,
} from 'ag-grid-community';
import { ClientGroup } from '../../models/ClientGroup';
import { Store } from '@ngxs/store';
import { ClientGroupService } from '../../services/client-group-services/client-group.service';

import {
  AddClientGroup,
  LoadClientGroups,
} from '../../client-group-state/client-group.action';
import { ClientGroupState } from '../../client-group-state/client-group.state';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { SaveButtonRendererComponent } from '../../../../shared/component/save-button-renderer/save-button-renderer.component';

@Component({
  selector: 'app-client-group',
  standalone: false,
  templateUrl: './client-group.component.html',
  styleUrl: './client-group.component.css',
})
export class ClientGroupComponent {
  // @Select(state => state.clientGroups) clientGroups$!: Observable<ClientGroup[]>;
  ActiveToggleRendererComponent = ActiveToggleRendererComponent;
  SoftDeleteRendererComponent = SoftDeleteButtonRendererComponent;
  SaveButtonRendererComponent = SaveButtonRendererComponent;

  gridApi!: GridApi;

  rowData: ClientGroup[] = [];
  columnDefs: ColDef<ClientGroup>[] = [
    {
      field: 'Name',
      headerName: 'Name',
      sortable: true,

      flex: 2,
      minWidth: 200,
      editable: true,
      cellEditor: 'agTextCellEditor',
      valueFormatter: (params) => (params.value ? params.value : 'Enter Name'),
      cellClassRules: {
        'hint-text': (params) => !params.value,
      },
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'IsActive',
      headerName: 'Active',
      cellRenderer: 'activeToggleRenderer',
      flex: 1,
      minWidth: 120,
      headerClass: 'bold-header',
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },

    {
      suppressHeaderMenuButton: true,
      pinned: 'right',
      sortable: false,
      filter: false,
      flex: 1,
      maxWidth: 90,
      cellRenderer: 'saveButtonRenderer',
      onCellClicked: (params: CellClickedEvent<ClientGroup>) => {
        if (params.data) this.saveRow(params.data);
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
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
      onCellClicked: (params: CellClickedEvent) => this.softDeleteProvider(params.data),
    },
  ];

  constructor(
    private store: Store,
    private clientGroupService: ClientGroupService,
    private toasterService: ToastrService
  ) {}

  defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true,
  };

  ngOnInit(): void {
    this.store.dispatch(new LoadClientGroups());
    this.store.select(ClientGroupState.getClientGroups).subscribe((data) => {
      console.log('From select:', data);
      this.rowData = data;
    });
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  onCellValueChanged(event: CellValueChangedEvent): void {
    const updatedRow = event.data;

    // 🔍 Find original row reference in rowData
    const index = this.rowData.findIndex(
      (r) => r === updatedRow || r.ClientGroupId === updatedRow.ClientGroupId
    );

    if (index > -1) {
      this.rowData[index].IsEdited = true; // ✅ Update actual reference
      this.gridApi.applyTransaction({ update: [this.rowData[index]] });
    }
  }

  saveRow(row: ClientGroup): void {
    const isComplete =
      row.Name &&
      row.Name.trim() !== '' &&
      row.IsActive !== null &&
      row.IsActive !== undefined;

    if (!isComplete) {
      this.toasterService.show(
        'Please complete all fields before saving.',
        'warning'
      );
      return;
    }

    const isNew = !row.ClientGroupId;

    // Skip save if not edited and not new
    if (!isNew && !row.IsEdited) {
      this.toasterService.show('No changes to save.', 'info');
      return;
    }

    const saveObservable = isNew
      ? this.clientGroupService.addClientGroup(row)
      : this.clientGroupService.updateClientGroup(row);

    saveObservable.subscribe({
      next: (savedRow: ClientGroup) => {
        this.toasterService.show('Saved successfully!', 'success');

        // ✅ Assign new ID if it's a fresh row
        if (isNew && savedRow?.ClientGroupId) {
          row.ClientGroupId = savedRow.ClientGroupId;
        }

        row.IsEdited = false;

        // ✅ Refresh grid UI
        this.gridApi.applyTransaction({ update: [row] });

        // ✅ Reload from store (ensures proper state)
        this.store.dispatch(new LoadClientGroups());

        // ✅ Optional: refresh cells to force UI update (you can keep or remove this)
        setTimeout(() => {
          this.gridApi.redrawRows();
        }, 100);
      },
      error: () => {
        this.toasterService.show('Failed to save. Try again.', 'error');
      },
    });
  }

  getRowClass = (params: any) => {
    // If AreaCodeId is not present, it's a newly added temporary row
    return !params.data.ClientGroupId ? 'temporary-row' : '';
  };

  softDeleteProvider(clientGroup: ClientGroup): void {
    // const updatedAreaCode = { ...areaCode, isDeleted: true };

    this.rowData = this.rowData.filter(
      (group) => group.ClientGroupId !== clientGroup.ClientGroupId
    );

    // this.store.dispatch(new SoftDeleteClientGroup(updatedAreaCode));

    this.toasterService.show('Removed successfully!', 'success');
  }

  addRow(): void {
    const newRow: ClientGroup = {
      Name: '',
      IsActive: true,
    };
    this.store.dispatch(new AddClientGroup(newRow));
  }

  getContextMenuItems: GetContextMenuItems = (
    params: GetContextMenuItemsParams
  ) => {
    const addRow = {
      name: 'Add Row',
      action: () => this.addRow(),
      icon: '<i class="fas fa-plus"></i>',
    };

    const deleteRow = {
      name: 'Delete Row',
      action: () => {
        if (params.node) {
          this.softDeleteProvider(params.node.data);
        }
      },
      icon: '<i class="fas fa-trash"></i>',
    };

    return [addRow, deleteRow, 'separator', 'copy', 'export'];
  };
}
