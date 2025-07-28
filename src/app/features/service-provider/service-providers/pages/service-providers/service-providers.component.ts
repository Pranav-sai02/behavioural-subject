import { Component } from '@angular/core';
import { ServiceProviders } from '../../models/ServiceProviders';
import { ServiceProvidersService } from '../../services/service-providers/service-providers.service';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  ICellRendererParams,
} from 'ag-grid-community';
import { SoftDeleteButtonRendererComponent } from '../../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { ActiveToggleRendererComponent } from '../../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';

import { ViewButtonRendererComponent } from '../../../../../shared/component/view-button-renderer/view-button-renderer.component';
import { ToastrService } from '../../../../../shared/component/toastr/services/toastr.service';

@Component({
  selector: 'app-service-providers',
  standalone: false,
  templateUrl: './service-providers.component.html',
  styleUrl: './service-providers.component.css',
})
export class ServiceProvidersComponent {
  ActiveToggleRendererComponent = ActiveToggleRendererComponent;
  SoftDeleteRendererComponent = SoftDeleteButtonRendererComponent;
  ViewButtonRendererComponent = ViewButtonRendererComponent;

  selectedProvider: ServiceProviders | null = null;
  isEditMode = false;
  showPopup = false;

  serviceProviders: ServiceProviders[] = [];
  gridApi!: GridApi;

  columnDefs: ColDef[] = [
    {
      field: 'Name',
      headerName: 'Name',
      flex: 2,
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'VATNumber',
      headerName: 'VAT Number',
      flex: 1,
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'CompanyRegNo',
      headerName: 'Company Reg. No',
      flex: 1,
      minWidth: 200,
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
      field: 'OfficeAddress',
      headerName: 'Office Address',
      flex: 1,
      minWidth: 200,
      // wrapText: true,
      // autoHeight: true,
      // cellStyle: {
      //   textAlign: 'left',
      //   whiteSpace: 'nowrap',
      //   overflow: 'hidden',
      //   textOverflow: 'ellipsis',
      // },
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'StorageAddress',
      headerName: 'Storage Address',
      flex: 1,
      minWidth: 200,
      // wrapText: true,
      // autoHeight: true,
      // cellStyle: {
      //   textAlign: 'left',
      //   whiteSpace: 'nowrap',
      //   overflow: 'hidden',
      //   textOverflow: 'ellipsis',
      // },
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
      field: 'Province',
      headerName: 'Province',
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'ServiceProviderTypes.Description',
      headerName: 'Service Type ',
      valueGetter: (params) =>
        params.data?.ServiceProviderTypes?.Description ?? 'N/A',

      flex: 1,
      minWidth: 140,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'DesignationNumber',
      headerName: 'Designation No',
      flex: 1,
      minWidth: 140,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'RatePerKm',
      headerName: 'Rate per Km',
      flex: 1,
      minWidth: 120,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'RateAuthorisedOn',
      headerName: 'Rate Authorised On',
      flex: 1,
      minWidth: 160,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'AuthorisedBy',
      headerName: 'Rate Authorised By',
      flex: 1,
      minWidth: 150,
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
      field: 'IsActiveOn',
      headerName: 'Active On',
      minWidth: 150,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'ActiveBy',
      headerName: 'Active By',
      minWidth: 150,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'IsVerified',
      headerName: 'Verified',
      minWidth: 100,
      cellRenderer: (params: any) => {
        const icon = params.value ? 'tick' : 'cross';
        return `<img src="assets/icons/${icon}.png" alt="${
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
      field: 'IsVerifiedOn',
      headerName: 'Verified On',
      minWidth: 150,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'VerifiedBy',
      headerName: 'Verified By',
      minWidth: 150,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'IsAccredited',
      headerName: 'Accredited',
      minWidth: 120,
      cellRenderer: (params: any) => {
        const icon = params.value ? 'tick' : 'cross';
        return `<img src="assets/icons/${icon}.png" alt="${
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
      field: 'IsAccreditedOn',
      headerName: 'Accredited On',
      minWidth: 150,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      field: 'AccreditedBy',
      headerName: 'Accredited By',
      minWidth: 150,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    // {
    //   field: 'ContactDetails',
    //   headerName: 'Contact Details',
    //   valueGetter: (params) =>
    //     params.data?.ContactDetails?.map(
    //       (c: any) => `${c.Type}: ${c.Value}`
    //     ).join(', '),
    //   minWidth: 250,
    //   maxWidth: 500,
    //   tooltipField: 'ContactDetails',
    //   cellStyle: {
    //     whiteSpace: 'nowrap',
    //     overflow: 'hidden',
    //     textOverflow: 'ellipsis',
    //     textAlign: 'left',
    //   },
    // },

    {
      suppressHeaderMenuButton: true,
      pinned: 'right',
      sortable: false,
      filter: false,
      maxWidth: 90,
      flex: 1,
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
      suppressHeaderMenuButton: true,
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
    headerClass: 'bold-header',
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
    cellStyle: {
      borderRight: '1px solid #ccc',
    },
  };

  constructor(
    private providerService: ServiceProvidersService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.providerService.getServiceProviders().subscribe({
      next: (data) => {
        this.serviceProviders = data;

        // ✅ Sort so newest records appear on top
        this.serviceProviders.sort(
          (a, b) => b.ServiceProviderId! - a.ServiceProviderId!
        );
      },
      error: (err) => {
        console.error('Failed to load service providers', err);
        this.toastrService.show('Failed to load data', 'error');
      },
    });
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;

    // Optional: Only auto-size some columns (e.g., short ones)
    const autoSizeThese = [
      'Name',
      'VATNumber',
      'Branch',
      'Manager',
      'Province',
    ];
    setTimeout(() => {
      const colIds =
        this.gridApi
          .getColumnDefs()
          ?.map((col: any) => col.field)
          .filter((id: string) => autoSizeThese.includes(id)) || [];
      this.gridApi.autoSizeColumns(colIds);
    }, 100);
  }

  resetColumns(): void {
    this.gridApi.setGridOption('columnDefs', this.columnDefs);
  }

  openPopup(rowData: ServiceProviders) {
    this.selectedProvider = rowData;
    this.isEditMode = true;
    this.showPopup = true;
  }

  handleFormSubmit(data: ServiceProviders) {
    this.providerService.addServiceProvider(data).subscribe({
      next: (newProvider) => {
        console.log('New provider added:', newProvider);

        if (newProvider && newProvider.ServiceProviderId) {
          this.serviceProviders = [newProvider, ...this.serviceProviders];

          this.toastrService.show(
            'Service provider added successfully',
            'success'
          );
        } else {
          this.toastrService.show('Invalid response from server', 'error');
        }

        this.showPopup = false;
      },
      error: (err) => {
        console.error('Add failed:', err);
        this.toastrService.show('Failed to add service provider', 'error');
      },
    });
  }

  softDelete(row: ServiceProviders): void {
    // Optional: Update model locally (if needed for visual feedback or logging)
    row.IsDeleted = true;

    // Soft delete API call
    this.providerService
      .softDeleteServiceProvider(row.ServiceProviderId!)
      .subscribe({
        next: () => {
          // Remove from UI only after success
          this.serviceProviders = this.serviceProviders.filter(
            (r) => r.ServiceProviderId !== row.ServiceProviderId
          );
          this.serviceProviders = [...this.serviceProviders]; // trigger Angular UI update

          this.toastrService.show('Removed successfully', 'success');
        },
        error: () => {
          this.toastrService.show('Failed to delete', 'error');
        },
      });
  }
}
