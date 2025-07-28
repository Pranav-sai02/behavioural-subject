import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ServiceRow, ServicesPage } from '../../../service-provider/services-page/models/Services-page';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent
} from 'ag-grid-community';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { ServicesPageService } from '../../../service-provider/services-page/services/service-page/services-page.service';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { TabStateService } from '../../services/tabs-behavioural-service/tabState.service';
import { Subscription } from 'rxjs';
import { ClientService as ApiClientService } from '../../models/Client';

@Component({
  selector: 'app-client-services',
  templateUrl: './client-services.component.html',
  standalone: false,
  styleUrls: ['./client-services.component.css']
})
export class ClientServicesComponent implements OnInit, OnDestroy {
  @Input() clientId!: number;

  rows: ServiceRow[] = [];
  private gridApi!: GridApi;
  private subs = new Subscription();
  showPopup = false;

  SoftDeleteRendererComponent = SoftDeleteButtonRendererComponent;

  columnDefs: ColDef<ServiceRow>[] = [
    {
      field: 'Description',
      headerName: 'Service',
      sortable: true,
      flex: 1,
      minWidth: 200,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header'
    },
    {
      suppressHeaderMenuButton: true,
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
        justifyContent: 'center'
      },
      headerClass: 'bold-header',
      onCellClicked: (e: CellClickedEvent) => this.softDelete(e.data)
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100
  };

  constructor(
    private spSvc: ServicesPageService,
    private toastr: ToastrService,
    private tabState: TabStateService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.tabState.getServices().subscribe(state => {
        if (state.ClientService?.length) {
          this.rows = this.mapToServiceRow(state.ClientService);
        } else {
          this.loadServices();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadServices(): void {
    this.spSvc.getAllServices().subscribe({
      next: (data: ServicesPage[]) => {
        this.rows = this.mapFromServicesPage(data);
        this.tabState.updateServices({
          ClientService: this.mapToClientService(this.rows)
        });
      },
      error: err => {
        console.error('Failed to load services:', err);
        this.toastr.show('Failed to load services. Try again.', 'error');
      }
    });
  }

  onGridReady(ev: GridReadyEvent): void {
    this.gridApi = ev.api;
    (this.gridApi as any).setRowData(this.rows); // cast to any for compatibility
  }

  softDelete(svc: ServiceRow): void {
    svc.IsDeleted = true;
    this.rows = this.rows.filter(r => r.ServiceId !== svc.ServiceId);
    this.tabState.updateServices({
      ClientService: this.mapToClientService(this.rows)
    });
    this.toastr.show('Removed successfully', 'success');
  }

  onServiceLinked(newSvc: ServiceRow): void {
    this.rows = [...this.rows, newSvc];
    this.tabState.updateServices({
      ClientService: this.mapToClientService(this.rows)
    });
    this.showPopup = false;
    this.toastr.show('Service linked successfully', 'success');
  }

  /** Convert ServiceRow[] → ClientService[] */
  private mapToClientService(rows: ServiceRow[]): ApiClientService[] {
    return rows.map(r => ({
      ClientServiceId: 0,
      ClientId: this.clientId || 0,
      ServiceId: r.ServiceId,
      Note: '',
      TransferNumber: '',
      ServiceDto: {
        ServiceId: r.ServiceId,
        Description: r.Description
      }
    }));
  }

  /** Convert ClientService[] → ServiceRow[] */
  private mapToServiceRow(cs: ApiClientService[]): ServiceRow[] {
    return cs.map(c => ({
      ServiceId: c.ServiceDto.ServiceId,
      Description: c.ServiceDto.Description,
      IsDeleted: false
    }));
  }

  /** Convert ServicesPage[] (API) → ServiceRow[] */
  private mapFromServicesPage(sp: ServicesPage[]): ServiceRow[] {
    return sp.map(s => ({
      ServiceId: s.ServiceId,
      Description: s.Description,
      IsDeleted: false
    }));
  }
}
