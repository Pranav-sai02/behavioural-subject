import { Component } from '@angular/core';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import { ServicesPage } from '../../models/Services-page';
import { ServicesPageService } from '../../services/service-page/services-page.service';
import { ActiveToggleRendererComponent } from '../../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';

import { ViewButtonRendererComponent } from '../../../../../shared/component/view-button-renderer/view-button-renderer.component';
import { ToastrService } from '../../../../../shared/component/toastr/services/toastr.service';

@Component({
  selector: 'app-services-page',
  standalone: false,
  templateUrl: './services-page.component.html',
  styleUrl: './services-page.component.css',
})
export class ServicesPageComponent {
  rows: ServicesPage[] = [];
  private gridApi!: GridApi;

  showPopup = false; // controls popup visibility
  selectedService: ServicesPage | null = null; // currently selected service for popup

  ActiveToggleRendererComponent = ActiveToggleRendererComponent;
  SoftDeleteRendererComponent = SoftDeleteButtonRendererComponent;
  ViewButtonRendererComponent = ViewButtonRendererComponent;

  columnDefs: ColDef<ServicesPage>[] = [
    {
      field: 'Description',
      headerName: 'Description',
      sortable: true,
      flex: 1,
      minWidth: 200,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'ServiceType',
      headerName: 'Service Type',
      flex: 2,
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'NotePlain',
      headerName: 'Note Plain',
      flex: 1,
      minWidth: 200,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'EnforceMobileNumber',
      headerName: 'Enforce Mobile',
      flex: 1,
      minWidth: 200,
      cellRenderer: (params: any) => {
        const imagePath = params.value
          ? 'assets/icons/tick.png'
          : 'assets/icons/cross.png';
        return `<img src="${imagePath}" alt="${
          params.value ? 'Yes' : 'No'
        }" style="width: 20px; height: 20px;" />`;
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
      field: 'SendRefSMSEnabled',
      headerName: 'Send Ref SMS',
      flex: 1,
      minWidth: 200,
      cellRenderer: (params: any) => {
        const imagePath = params.value
          ? 'assets/icons/tick.png'
          : 'assets/icons/cross.png';
        return `<img src="${imagePath}" alt="${
          params.value ? 'Yes' : 'No'
        }" style="width: 20px; height: 20px;" />`;
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
      field: 'IsActive',
      headerName: 'Active',
      flex: 1,
      minWidth: 200,
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
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '17px',
      },
      onCellClicked: (params: CellClickedEvent) => this.openPopup(params.data),
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
      onCellClicked: (params: CellClickedEvent) => this.softDelete(params.data),
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  };

  constructor(
    private spSvc: ServicesPageService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.spSvc.getAllServices().subscribe({
      next: (data) => {
        this.rows = data;
        setTimeout(() => this.autoSizeColumnsBasedOnContent(), 0);
      },
      error: (err) => {
        console.error('Failed to load services:', err);
        this.toastrService.show('Failed to load services. Try again.', 'error');
      },
    });
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
    this.autoSizeColumnsBasedOnContent();
  }

  onFitColumns() {
    if (!this.gridApi) return;

    const allColDefs = this.gridApi.getColumnDefs() ?? [];

    const allColumnFields = allColDefs
      .filter(
        (colDef): colDef is ColDef => (colDef as ColDef).field !== undefined
      )
      .map((colDef) => (colDef as ColDef).field!)
      .filter((field) => field !== undefined);

    const columnsToFit = allColumnFields.filter(
      (field) =>
        ![
          'Description',
          'ServiceType',
          'Note',
          'NotePlain',
          'EnforceMobileNumber',
          'SendRefSMSEnabled',
          'IsActive',
        ].includes(field)
    );

    if (columnsToFit.length) {
      this.gridApi.autoSizeColumns(columnsToFit, false);
    }
  }

  autoSizeColumnsBasedOnContent() {
    if (!this.gridApi) return;

    const columnsToAutoSize = [
      'Description',
      'ServiceType',
      'Note',
      'NotePlain',
      'EnforceMobileNumber',
      'SendRefSMSEnabled',
      'IsActive',
    ];
    this.gridApi.autoSizeColumns(columnsToAutoSize, false);
  }

  // Open popup with selected service details
  openPopup(service: ServicesPage): void {
    this.selectedService = service;
    this.showPopup = true;
  }

  // Close popup and reset selected service
  closePopup(): void {
    this.showPopup = false;
    this.selectedService = null;
  }

  // Handle form submit from popup: update the grid data
  onServiceFormSubmit(updatedService: ServicesPage): void {
    const index = this.rows.findIndex(
      (s) => s.ServiceId === updatedService.ServiceId
    );
    if (index > -1) {
      this.rows[index] = updatedService;
      this.rows = [...this.rows]; // update reference to trigger Angular change detection
      this.gridApi.refreshCells(); // optionally refresh grid cells
    }
    this.closePopup();
  }

  softDelete(ServicesPage: ServicesPage): void {
    // Mark the item as deleted (optional if you want to preserve the flag)
    ServicesPage.IsDeleted = true;

    // Remove it from rowData
    this.rows = this.rows.filter(
      (group) => group.ServiceId !== ServicesPage.ServiceId
    );

    // Optionally update the grid manually if you want
    // this.gridApi.setRowData(this.rowData);

    this.toastrService.show('Removed successfully', 'success');
  }
}
