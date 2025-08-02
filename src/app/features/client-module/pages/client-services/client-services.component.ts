import { Component, OnInit } from '@angular/core';
import { ServicesPage } from '../../../service-provider/services-page/models/Services-page';
import { CellClickedEvent, ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { ServicesPageService } from '../../../service-provider/services-page/services/service-page/services-page.service';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { UnlinkCellRendererComponent } from '../../../../shared/component/unlink-cell-renderer/unlink-cell-renderer.component';
import { LinkedServicesService } from '../../services/linkservice/linked-services.service';





@Component({
  selector: 'app-client-services',
  standalone: false,
  templateUrl: './client-services.component.html',
  styleUrl: './client-services.component.css',
})
export class ClientServicesComponent implements OnInit {

 UnlinkCellRendererComponent = UnlinkCellRendererComponent;

  rows: ServicesPage[] = [];
  private gridApi!: GridApi;

  showPopup = false;

  columnDefs: ColDef[] = [
    {
      field: 'Description',
      headerName: 'Service',
      flex: 1,
      minWidth: 200,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      headerName: 'Delete',
      suppressHeaderMenuButton: true,
      pinned: 'right',
      sortable: false,
      filter: false,
      flex: 1,
      maxWidth: 100,
      cellRenderer: 'unlinkCellRenderer',
      onCellClicked: ({ data }: CellClickedEvent) => this.softDelete(data),
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
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  };

  constructor(
    private toastr: ToastrService,
    private linkedServicesService: LinkedServicesService
  ) {}

  ngOnInit(): void {
    this.linkedServicesService.linkedServices$.subscribe((services) => {
      this.rows = [...services];
    });
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
  }

  softDelete(service: ServicesPage): void {
    const updatedRows = this.rows.filter(
      (s) => s.ServiceId !== service.ServiceId
    );
    this.rows = updatedRows;
    this.linkedServicesService.removeService(service.ServiceId);
    this.toastr.show('Service removed', 'success');
  }

  onServiceLinked(newService: ServicesPage): void {
    const exists = this.rows.some((s) => s.ServiceId === newService.ServiceId);
    if (!exists) {
      const updatedRows = [...this.rows, newService];
      this.rows = updatedRows;
      this.linkedServicesService.addService(newService);
      this.toastr.show('Service linked', 'success');
    } else {
      this.toastr.show('Service already exists', 'info');
    }
    this.showPopup = false;
  }
}
