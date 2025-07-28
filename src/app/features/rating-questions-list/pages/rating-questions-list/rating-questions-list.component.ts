import { Component, OnInit } from '@angular/core';
import {
  CellClickedEvent,
  CellValueChangedEvent,
  ColDef,
  GetContextMenuItems,
  GetContextMenuItemsParams,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { RatingQuestion } from '../../models/rating-questions.model';
import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { Store } from '@ngxs/store';

import { RatingQuestionService } from '../../services/rating-questions.service';
import { RatingQuestionTypeService } from '../../../rating-questions-types/services/rating-question-types.service';
import { ViewButtonRendererComponent } from '../../../../shared/component/view-button-renderer/view-button-renderer.component';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';

@Component({
  selector: 'app-rating-questions-list',
  standalone: false,
  templateUrl: './rating-questions-list.component.html',
  styleUrl: './rating-questions-list.component.css',
})
export class RatingQuestionsListComponent implements OnInit {
  ActiveToggleRendererComponent = ActiveToggleRendererComponent;
  SoftDeleteRendererComponent = SoftDeleteButtonRendererComponent;
  ViewButtonRendererComponent = ViewButtonRendererComponent;

  gridApi!: GridApi;
  rowData: RatingQuestion[] = [];

  selectedOption: RatingQuestion | null = null;
  showPopup = false;
  isEditMode = false;

  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true,
  };

  columnDefs: ColDef<RatingQuestion>[] = [
    {
      field: 'Question',
      headerName: 'Question',
      minWidth: 350,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      headerName: 'Question Type',
      field: 'RatingQuestionType.QuestionType',
      valueGetter: (params) =>
        params.data?.RatingQuestionType?.QuestionType || '—',
      minWidth: 280,

      cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'ListRank',
      headerName: 'Rank',
      minWidth: 200,
      cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'IsActive',
      headerName: 'Active',
      minWidth: 250,
      cellRenderer: 'activeToggleRenderer',
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
      suppressHeaderMenuButton: true,
      pinned: 'right',
      sortable: false,
      filter: false,
      flex: 1,
      maxWidth: 90,
      cellRenderer: 'viewButtonRenderer',
      onCellClicked: (params: CellClickedEvent) =>
        this.openEditPopup(params.data),
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
      suppressHeaderMenuButton: true,
      pinned: 'right',
      sortable: false,
      filter: false,
      flex: 1,
      maxWidth: 100,
      cellRenderer: 'softDeleteRenderer',
      onCellClicked: (params: CellClickedEvent) =>
        this.confirmSoftDelete(params.data),
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },
  ];

  constructor(
    private listservice: RatingQuestionService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.listservice.getAll().subscribe({
      next: (data) => {
        this.rowData = data;
      },
      error: () => {
        this.toaster.show('Failed to load questions', 'error');
      },
    });
  }

  openEditPopup(option: RatingQuestion): void {
    this.selectedOption = option;
    this.isEditMode = true;
    this.showPopup = true;
  }

  handleFormSubmit(formData: RatingQuestion): void {
    if (this.isEditMode && this.selectedOption?.RatingQuestionId) {
      // PUT
      const updatedData: RatingQuestion = {
        ...this.selectedOption,
        ...formData,
      };

      this.listservice
        .update(updatedData.RatingQuestionId!, updatedData)
        .subscribe({
          next: () => {
            this.toaster.show('Question updated successfully', 'success');
            this.showPopup = false;
            this.refreshTable();
          },
          error: (err) => {
            console.error('PUT failed:', err);
            this.toaster.show('Failed to update question', 'error');
          },
        });
    } else {
      // POST
      const newQuestion: RatingQuestion = {
        ...formData,
        IsDeleted: false,
      };

      this.listservice.create(newQuestion).subscribe({
        next: () => {
          this.toaster.show('Question created successfully', 'success');
          this.showPopup = false;
          this.refreshTable();
        },
        error: (err) => {
          console.error('POST failed:', err);
          this.toaster.show('Failed to create question', 'error');
        },
      });
    }
  }

  refreshTable(): void {
    this.listservice.getAll().subscribe({
      next: (data) => {
        this.rowData = data;
      },
      error: () => {
        this.toaster.show('Failed to reload questions', 'error');
      },
    });
  }

  confirmSoftDelete(list: RatingQuestion): void {
    if (!list?.RatingQuestionId) {
      this.toaster.show('Invalid record (missing ID)', 'error');
      return;
    }

    // Optimistic UI update
    this.rowData = this.rowData.filter(
      (r) => r.RatingQuestionId !== list.RatingQuestionId
    );
    this.toaster.show('Deleted successfully', 'success');

    this.listservice.softDelete(list.RatingQuestionId).subscribe({
      error: () => this.toaster.show('Failed to delete on server', 'error'),
    });
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit(); // Optional: auto-resize columns to fit
  }
}
