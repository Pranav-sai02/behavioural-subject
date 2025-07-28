import { Component } from '@angular/core';
import { ClaimCentre } from '../../models/ClaimCentre';
import { GridApi, ColDef, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';

import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';

import { ViewButtonRendererComponent } from '../../../../shared/component/view-button-renderer/view-button-renderer.component';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { ClaimCentreService } from '../../services/claim-centre-services/claim-centre.service';

@Component({
  selector: 'app-claim-centre',
  standalone: false,
  templateUrl: './claim-centre.component.html',
  styleUrl: './claim-centre.component.css',
})
export class ClaimCentreComponent {
  rowData: ClaimCentre[] = [];
  gridApi!: GridApi;
  selectedClaim: ClaimCentre | null = null;
  showPopup = false;
  isEditMode = false;

  columnDefs: ColDef[] = [
    {
      field: 'ClientGroup',
      headerName: 'Client Group',
      flex: 1,
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'Name',
      headerName: 'Name',
      flex: 2,
      minWidth: 150,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'Branch',
      headerName: 'Branch',
      flex: 1,
      minWidth: 160,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'TownCity',
      headerName: 'Town / City',
      flex: 1,
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'Address',
      headerName: 'Address',
      flex: 1,
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'Province',
      headerName: 'Province',
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'IsActive',
      headerName: 'Active',
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
      cellRenderer: 'viewButtonRenderer',
      onCellClicked: (params: CellClickedEvent) => this.openPopup(params.data),
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '17px',
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
    flex: 1,
    minWidth: 100,
  };

  components = {
    activeToggleRenderer: ActiveToggleRendererComponent,
    softDeleteRenderer: SoftDeleteButtonRendererComponent,
    viewButtonRenderer: ViewButtonRendererComponent,
  };

  constructor(
    private claimCentreService: ClaimCentreService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  loadData(): void {
    this.claimCentreService.getClaimCentres().subscribe((data) => {
      this.rowData = data;
    });
  }

  openPopup(row: ClaimCentre): void {
    this.selectedClaim = row;
    this.isEditMode = true;
    this.showPopup = true;
  }

  handleFormSubmit(data: ClaimCentre): void {
    console.log('Form submitted with data:', data);
    this.showPopup = false;
    this.loadData();
    this.toastrService.show('Claim updated successfully', 'success');
  }

  softDelete(row: ClaimCentre): void {
    if (!row?.ClaimCentreId) {
      this.toastrService.show('Invalid claim record (missing ID).', 'error');
      return;
    }

    // Optimistically update UI
    this.rowData = this.rowData.filter((r) => r.ClaimCentreId !== row.ClaimCentreId);
    this.toastrService.show('Claim deleted successfully', 'success');

    // Delete from backend
    this.claimCentreService.deleteClaimCentre(row.ClaimCentreId).subscribe();
  }
}
