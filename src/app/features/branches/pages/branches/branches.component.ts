import { Component, OnInit } from '@angular/core';
import {
  GridApi,
  ColDef,
  GetContextMenuItemsParams,
  GetContextMenuItems,
  CellClickedEvent,
} from 'ag-grid-community';
import { Store } from '@ngxs/store';
import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { Branches } from '../../models/Branches';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import {
  AddBranchRowLocally,
  LoadBranches,
  SoftDeleteBranch,
  UpdateBranch,
} from '../../state/branch.actions';
import { BranchesState } from '../../state/branch.state';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { SaveButtonRendererComponent } from '../../../../shared/component/save-button-renderer/save-button-renderer.component';

@Component({
  selector: 'app-branches',
  standalone: false,
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css',
})
export class BranchesComponent implements OnInit {
  ActiveToggleRendererComponent = ActiveToggleRendererComponent;
  SoftDeleteRendererComponent = SoftDeleteButtonRendererComponent;
  SaveButtonRendererComponent = SaveButtonRendererComponent;

  gridApi!: GridApi;
  rowData: Branches[] = [];

  columnDefs: ColDef<Branches>[] = [
    {
      field: 'Name',
      headerName: 'BranchName',
      flex: 2,
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
      editable: true,
    },
    {
      field: 'Province',
      headerName: 'Province',
      flex: 1,
      minWidth: 150,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
      editable: true,
    },
     {
      field: 'Country',
      headerName: 'Country',
      flex: 1,
      minWidth: 200,
      cellStyle:{
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
      editable: true,
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
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
      onCellClicked: (params: CellClickedEvent) => {
        if (params?.data) {
          this.saveRow(params.data);
        }
      },
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
    this.store.dispatch(new LoadBranches()).subscribe({
      error: (err) => {
        this.logger.logError(err, 'BranchComponent.ngOnInit');
        this.toaster.show('Failed to load branches', 'error');
      },
    });

    this.store.select(BranchesState.getBranches).subscribe({
      next: (data) => (this.rowData = data),
    });
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  onCellValueChanged(event: any): void {
    const row = event.data;
    row.isEdited = true;
    this.gridApi.applyTransaction({ update: [row] });
  }

  saveRow(row: Branches): void {
    const isNew = !row.BranchId;
    const trimmed = {
      Name: row.Name?.trim(),
      Country:row.Country?.trim(),
      Province: row.Province?.trim(),
      IsActive: row.IsActive,
    };

    if (!isNew && !row.isEdited) {
      this.toaster.show('No changes to save.', 'info');
      return;
    }

    const payload = { ...row, ...trimmed };

    this.store.dispatch(new UpdateBranch(row.BranchId!, payload)).subscribe({
      next: () => {
        this.toaster.show('Saved successfully', 'success');
        row.isEdited = false;
        this.gridApi.applyTransaction({ update: [row] });
      },
      error: (err) => {
        this.toaster.show('Failed to save branch', 'error');
        this.logger.logError(err, 'BranchComponent.saveRow');
      },
    });
  }

  softDelete(row: Branches): void {
    const updated = { ...row, IsDelete: true };
    this.store.dispatch(new SoftDeleteBranch(updated)).subscribe({
      next: () => this.toaster.show('Deleted successfully', 'success'),
      error: (err) => {
        this.toaster.show('Failed to delete branch', 'error');
        this.logger.logError(err, 'BranchComponent.softDelete');
      },
    });
  }

  addRow(): void {
    const newRow: Branches = {
      Name: '',
      Country:'',
      Province: '',
      IsActive: true,
      IsDelete: false,
    };
    this.store.dispatch(new AddBranchRowLocally(newRow));
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
          this.softDelete(params.node.data);
        }
      },
      icon: '<i class="fas fa-trash"></i>',
    };

    return [addRow, deleteRow, 'separator', 'copy', 'export'];
  };

  getRowClass = (params: any) => (!params.data.BranchId ? 'temporary-row' : '');
}