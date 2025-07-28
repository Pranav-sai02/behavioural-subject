import { Component, OnDestroy, OnInit } from '@angular/core';
import { ServiceProviders } from '../../../service-provider/service-providers/models/ServiceProviders';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { ServiceProvidersService } from '../../../service-provider/service-providers/services/service-providers/service-providers.service';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnlinkCellRendererComponent } from '../../../../shared/component/unlink-cell-renderer/unlink-cell-renderer.component';
import { ServiceProvidersStateService } from '../../../service-provider/service-providers/services/service-providers-state/service-providers-state.service';

@Component({
  selector: 'app-service-provider',
  standalone: false,
  templateUrl: './service-provider.component.html',
  styleUrl: './service-provider.component.css',
})
export class ServiceProviderComponent implements OnInit, OnDestroy {
  serviceProviders: ServiceProviders[] = [];
  gridApi!: GridApi;
  form: FormGroup;

  serviceProivderList: { id: string; name: string }[] = [];

  UnlinkCellRendererComponent = UnlinkCellRendererComponent;

  columnDefs: ColDef<ServiceProviders>[] = [
    {
      field: 'Name',
      headerName: 'Service Provider',
      flex: 1,
      minWidth: 200,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      suppressHeaderMenuButton: true,
      pinned: 'right',
      flex: 1,
      maxWidth: 100,
      cellRenderer: 'unlinkCellRenderer',
      cellRendererParams: {
        onUnlink: (data: ServiceProviders) => this.softDelete(data),
      },
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

  constructor(
    private providerService: ServiceProvidersService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private stateService: ServiceProvidersStateService // ✅ Inject state service
  ) {
    this.form = this.fb.group({
      selectedServiceProvider: [null],
    });
  }

  ngOnInit(): void {
    this.loadProviders();

    this.stateService.linkedProviders$.subscribe((providers) => {
      if (this.gridApi) {
        this.gridApi.setGridOption('rowData', providers);
      }
    });
  }

  private loadProviders(): void {
    this.providerService.getServiceProviders().subscribe({
      next: (data) => {
        this.serviceProviders = data;
        this.serviceProivderList = data
          .filter((sp) => sp.IsActive)
          .map((sp) => ({
            id: sp.ServiceProviderId?.toString() || '',
            name: sp.Name,
          }));
      },
      error: (err) => {
        console.error('Failed to load service providers:', err);
        this.toastrService.show(
          'Failed to load service providers. Try again.',
          'error'
        );
      },
    });
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;

    // Replace all data
    const rowData = this.stateService.getLinkedProviders();
    this.gridApi.setGridOption('rowData', rowData);
  }

  softDelete(provider: ServiceProviders): void {
    const id = provider.ServiceProviderId;
    if (!id) return;

    this.stateService.removeProvider(id); // ✅ Update state

    this.gridApi.applyTransaction({ remove: [provider] });

    this.toastrService.show('Item unlinked successfully', 'success');

    this.providerService.softDeleteServiceProvider(id).subscribe({
      error: () => {
        this.toastrService.show('Failed to unlink item', 'error');
      },
    });
  }

  addServiceProviderToGrid(): void {
    const selectedId = this.form.get('selectedServiceProvider')?.value;

    if (!selectedId) {
      this.toastrService.show('Please select a service provider.', 'error');
      return;
    }

    const alreadyAdded = this.stateService
      .getLinkedProviders()
      .some((sp) => sp.ServiceProviderId?.toString() === selectedId);

    if (alreadyAdded) {
      this.toastrService.show('Service provider already added.', 'info');
      return;
    }

    const providerToAdd = this.serviceProviders.find(
      (sp) => sp.ServiceProviderId?.toString() === selectedId
    );

    if (!providerToAdd) {
      this.toastrService.show('Service provider not found.', 'error');
      return;
    }

    this.stateService.addProvider(providerToAdd); // ✅ Update state
    this.form.get('selectedServiceProvider')?.reset();
    this.toastrService.show(`${providerToAdd.Name} added to grid`, 'success');
  }

  ngOnDestroy(): void {
    // Optional: persist to localStorage or server if needed
  }
}
