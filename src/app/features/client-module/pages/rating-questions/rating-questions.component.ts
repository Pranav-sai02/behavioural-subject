import { UnlinkCellRendererComponent } from './../../../../shared/component/unlink-cell-renderer/unlink-cell-renderer.component';
import { Component, OnInit } from '@angular/core';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { RatingQuestion } from '../../../rating-questions-list/models/rating-questions.model';
import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { RatingQuestionService } from '../../../rating-questions-list/services/rating-questions.service';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RatingQuestionsListStateService } from '../../../rating-questions-list/services/rating-questions-list-state/rating-questions-list-state.service';
@Component({
  selector: 'app-rating-questions',
  standalone: false,
  templateUrl: './rating-questions.component.html',
  styleUrl: './rating-questions.component.css',
})
export class RatingQuestionsComponent implements OnInit {
  ActiveToggleRendererComponent = ActiveToggleRendererComponent;

  UnlinkCellRendererComponent = UnlinkCellRendererComponent;

  gridApi!: GridApi;
  rowData: RatingQuestion[] = [];

  allQuestions: RatingQuestion[] = [];

  selectedOption: RatingQuestion | null = null;
  showPopup = false;
  isEditMode = false;

  defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true,
  };

  form: FormGroup;
  ratingQuestionsList: { id: number; name: string }[] = [];

  columnDefs: ColDef<RatingQuestion>[] = [
    {
      field: 'Question',
      headerName: 'Question',
      minWidth: 250,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },

    {
      field: 'ListRank',
      headerName: 'Rank',
      minWidth: 100,
      cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
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
      //field: 'IsDeleted',
     // headerName: 'Delete',
      suppressHeaderMenuButton: true,
      pinned: 'right',
      flex: 1,
      maxWidth: 100,
      filter:false,
      cellRenderer: 'unlinkCellRenderer',
      onCellClicked: (params: CellClickedEvent) =>
        this.confirmSoftDelete(params.data),

      // cellRendererParams: {
      //   onUnlink: (rowData: any) => this.onUnlinkRow(rowData), // ✅ Pass it inside this
      // },
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },

    // {
    //   suppressHeaderMenuButton: true,
    //   pinned: 'right',
    //   flex: 1,
    //   maxWidth: 100,

    //   cellRenderer: (params: any) => {
    //     return `<i class="fas fa-unlink" style="cursor: pointer; color: red;" title="Unlink"></i>`;
    //   },

    //   onCellClicked: (params: CellClickedEvent) =>
    //     this.confirmSoftDelete(params.data),
    //   cellStyle: {
    //     borderRight: '1px solid #ccc',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //   },
    //   headerClass: 'bold-header',
    // },
  ];

  constructor(
    private listservice: RatingQuestionService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private stateService: RatingQuestionsListStateService // ⬅️ Inject the service
  ) {
    this.form = this.fb.group({
      selectedRatingQuestion: [null],
    });
  }

  ngOnInit(): void {
    this.listservice.getAll().subscribe({
      next: (data) => {
        this.allQuestions = data; // 🔁 Store all questions separately

        // Only show active and non-deleted questions in dropdown
        this.ratingQuestionsList = data
          .filter((q) => q.IsActive && !q.IsDeleted)
          .map((q) => ({
            id: q.RatingQuestionId!,
            name: q.Question,
          }));

       // this.rowData = []; // ❌ Don’t populate grid initially
         // 👇 Load previously stored data (on return from other tabs)
      this.stateService.ratingQuestions$.subscribe(questions => {
        this.rowData = questions;
      });
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


      // Remove from state
  this.stateService.removeRatingQuestion(list.RatingQuestionId);
  this.toaster.show('Item unlinked successfully', 'success');


    // Optimistic UI update
    this.rowData = this.rowData.filter(
      (r) => r.RatingQuestionId !== list.RatingQuestionId
    );
    this.toaster.show('Item unlinked successfully', 'success');

    this.listservice.softDelete(list.RatingQuestionId).subscribe({
      error: () => this.toaster.show('Failed to unlink item', 'error'),
    });
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit(); // Optional: auto-resize columns to fit
  }

 onAddSelectedQuestion(): void {
  const selectedId = this.form.get('selectedRatingQuestion')?.value;

  if (!selectedId) {
    this.toaster.show('Please select a question to add', 'warning');
    return;
  }

  const alreadyExists = this.stateService.getRatingQuestions().some(
    (row) => row.RatingQuestionId === selectedId
  );

  if (alreadyExists) {
    this.toaster.show('This question is already added', 'info');
    return;
  }

  const fullQuestionData = this.allQuestions.find(
    (q) => q.RatingQuestionId === selectedId
  );

  if (!fullQuestionData) {
    this.toaster.show('Selected question not found', 'error');
    return;
  }

  // ✅ Add to global state
  this.stateService.addRatingQuestion(fullQuestionData);
  this.form.get('selectedRatingQuestion')?.reset();
}

  onUnlinkRow(rowData: any): void {
    this.toaster.show(`Unlink clicked for row: ${rowData.Question}`, 'success');
    // Your unlink logic here
  }
}
