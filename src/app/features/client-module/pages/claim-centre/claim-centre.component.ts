import { Component } from '@angular/core';
import { ClaimCentre } from '../../../claim-centre/models/ClaimCentre';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';

import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnlinkCellRendererComponent } from '../../../../shared/component/unlink-cell-renderer/unlink-cell-renderer.component';
import { ClaimCentreService } from '../../../claim-centre/services/claim-centre-services/claim-centre.service';
import { ClaimCentreStateService } from '../../../claim-centre/services/claim-centre-state/claim-centre-state.service';

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
  form: FormGroup;
  UnlinkCellRendererComponent = UnlinkCellRendererComponent;

  columnDefs: ColDef[] = [
    {
      field: 'Branch',
      headerName: 'ClaimCenter',
      flex: 1,
      minWidth: 160,
      cellStyle: {
        borderRight: '1px solid #ccc',
      },
      headerClass: 'bold-header',
    },
    {
      // field: 'IsDeleted',
      // headerName: 'Delete',
      suppressHeaderMenuButton: true,
      pinned: 'right',
      flex: 1,
      filter: false,
      maxWidth: 100,
      cellRenderer: 'unlinkCellRenderer',
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
    unlinkCellRenderer: UnlinkCellRendererComponent,
  };

  claimCentreList: { id: number; name: string }[] = [];

  constructor(
    private claimCentreService: ClaimCentreService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private stateService: ClaimCentreStateService
  ) {
    this.form = this.fb.group({
      selectedClaimCentre: [null],
    });
  }

  ngOnInit(): void {
    this.loadClaimCentreList();

    // ✅ Load from state when component is initialized
    this.stateService.claimCentres$.subscribe((data) => {
      this.rowData = data;
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  loadClaimCentreList(): void {
    this.claimCentreService.getClaimCentres().subscribe((data) => {
      // Only active branches
      const activeClaimCentres = data.filter((c) => c.IsActive && !c.IsDeleted);
      this.claimCentreList = activeClaimCentres.map((item) => ({
        id: item.ClaimCentreId!,
        name: item.Branch || '',
      }));
    });
  }

  onAddClaimCentre(): void {
    const selectedId = this.form.value.selectedClaimCentre;

    if (!selectedId) {
      this.toastrService.show('Please select a Claim Centre', 'error');
      return;
    }

    const alreadyExists = this.stateService
      .getClaimCentres()
      .some((c) => c.ClaimCentreId === selectedId);

    if (alreadyExists) {
      this.toastrService.show('Claim Centre already added to grid', 'info');
      return;
    }

    this.claimCentreService.getClaimCentres().subscribe((data) => {
      const selectedData = data.find((c) => c.ClaimCentreId === selectedId);

      if (selectedData) {
        // ✅ Add to shared state
        this.stateService.addClaimCentre(selectedData);

        this.toastrService.show('Claim Centre added to grid', 'success');
        this.form.get('selectedClaimCentre')?.reset();
      }
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
    this.loadClaimCentreList();
    this.toastrService.show('Claim updated successfully', 'success');
  }

  softDelete(row: ClaimCentre): void {
    if (!row?.ClaimCentreId) {
      this.toastrService.show('Invalid claim record (missing ID).', 'error');
      return;
    }

    // ✅ Remove from state
    this.stateService.removeClaimCentre(row.ClaimCentreId);
    this.toastrService.show('Item unlinked successfully.', 'success');

    this.claimCentreService.deleteClaimCentre(row.ClaimCentreId).subscribe({
      error: () => this.toastrService.show('Failed to unlink item', 'error'),
    });
  }
}
