import { Component } from '@angular/core';
import { CellClickedEvent, ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Documents } from '../../../documents/models/Documents';
import { DocumentsService } from '../../../documents/services/documents.service';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { FileLinkRendererComponent } from '../../../../shared/component/file-link-renderer/file-link-renderer.component';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';

@Component({
  selector: 'app-documents',
  standalone: false,
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent {
  rows: Documents[] = [];
  private gridApi!: GridApi;

  showPopup = false;
  SoftDeleteRendererComponent = SoftDeleteButtonRendererComponent;
  FileLinkRendererComponent = FileLinkRendererComponent;

  columnDefs: ColDef<Documents>[] = [
    {
      field: 'Description',
      headerName: 'Document',
      sortable: true,
      flex: 2,
      minWidth: 250,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'DocumentId',
      headerName: 'Rank',
      sortable: true,
      flex: 1,
      minWidth: 100,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
    {
      headerName: 'File',
      cellRenderer: 'fileLinkRenderer',
      flex: 1,
      minWidth: 100,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid #ccc',
      },
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
    private documentService: DocumentsService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.documentService.getAll().subscribe({
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

  softDelete(documents: Documents): void {
    documents.IsDelete = true;
    this.rows = this.rows.filter(
      (doc) => doc.DocumentId !== documents.DocumentId
    );
    this.toastrService.show('Removed successfully', 'success');
  }

  onServiceLinked(newDoc: Documents): void {
    this.rows.push(newDoc);
    this.rows = [...this.rows]; // trigger change detection
    this.toastrService.show('Document linked successfully', 'success');
  }
}
