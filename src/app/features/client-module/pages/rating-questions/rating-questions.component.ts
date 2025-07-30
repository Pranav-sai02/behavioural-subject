import { UnlinkCellRendererComponent } from './../../../../shared/component/unlink-cell-renderer/unlink-cell-renderer.component';
import { Component, OnInit } from '@angular/core';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { RatingQuestionService } from '../../../rating-questions-list/services/rating-questions.service';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TabStateService } from '../../services/tabs-behavioural-service/tabState.service';
import { RatingQuestion, ClientRatingQuestion } from '../../models/Client';

@Component({
  selector: 'app-rating-questions',
  standalone: false,
  templateUrl: './rating-questions.component.html',
  styleUrls: ['./rating-questions.component.css'],
})
export class RatingQuestionsComponent implements OnInit {
  ActiveToggleRendererComponent = ActiveToggleRendererComponent;
  UnlinkCellRendererComponent = UnlinkCellRendererComponent;

  gridApi!: GridApi;
  rowData: ClientRatingQuestion[] = [];
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

  columnDefs: ColDef<ClientRatingQuestion>[] = [
    {
      headerName: 'Question',
      minWidth: 250,
      valueGetter: (params) => {
        const q = this.allQuestions.find(
          (x) => x.RatingQuestionId === params.data?.RatingQuestionId
        );
        return q?.Question || '';
      },
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
      headerName: 'Active',
      minWidth: 150,
      valueGetter: (params) => {
        const q = this.allQuestions.find(
          (x) => x.RatingQuestionId === params.data?.RatingQuestionId
        );
        return q?.IsActive ? 'Yes' : 'No';
      },
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
      headerName: 'Delete',
      suppressHeaderMenuButton: true,
      pinned: 'right',
      flex: 1,
      maxWidth: 100,
      filter: false,
      cellRenderer: 'unlinkCellRenderer',
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
    private toaster: ToastrService,
    private fb: FormBuilder,
    private tabState: TabStateService
  ) {
    this.form = this.fb.group({
      selectedRatingQuestion: [null],
    });
  }

  ngOnInit(): void {
    this.loadAllQuestions();

    // Subscribe to Rating Questions from global TabState
    this.tabState.getRatingQuestions().subscribe((questions) => {
      this.rowData = [...questions];
    });
  }

  /** Load all rating questions (master list) */
  private loadAllQuestions(): void {
    this.listservice.getAll().subscribe({
      next: (data) => {
        // Map data to match RatingQuestion from Client.ts
        this.allQuestions = data.map((q) => ({
          RatingQuestionId: q.RatingQuestionId ?? 0,
          RatingQuestionTypeId: q.RatingQuestionTypeId ?? 0,
          RatingQuestionType: q.RatingQuestionType,
          Question: q.Question,
          IsActive: q.IsActive,
          ListRank: q.ListRank ?? 0,
        }));

        // Populate dropdown with active and non-deleted questions
        this.ratingQuestionsList = this.allQuestions
          .filter((q) => q.IsActive)
          .map((q) => ({
            id: q.RatingQuestionId,
            name: q.Question,
          }));
      },
      error: () => {
        this.toaster.show('Failed to load questions', 'error');
      },
    });
  }

  /** Add selected question to TabState */
  onAddSelectedQuestion(): void {
    const selectedId = this.form.get('selectedRatingQuestion')?.value;

    if (!selectedId) {
      this.toaster.show('Please select a question to add', 'warning');
      return;
    }

    const alreadyExists = this.rowData.some(
      (row) => row.RatingQuestionId === selectedId
    );
    if (alreadyExists) {
      this.toaster.show('This question is already added', 'info');
      return;
    }

    const fullQuestionData = this.allQuestions.find(
      (q) => q.RatingQuestionId === selectedId
    ) as RatingQuestion;

    if (!fullQuestionData) {
      this.toaster.show('Selected question not found', 'error');
      return;
    }

    const newItem: ClientRatingQuestion = {
      ClientRatingQuestionId: 0,
      ClientId: 0,
      RatingQuestionId: fullQuestionData.RatingQuestionId,
      ListRank: fullQuestionData.ListRank || 0,
      IsDeleted: false,
    };

    const updatedList = [...this.rowData, newItem];
    this.tabState.updateRatingQuestions(updatedList);
    this.rowData = updatedList;

    this.toaster.show('Question added successfully', 'success');
    this.form.get('selectedRatingQuestion')?.reset();
  }

  /** Soft delete from TabState */
  confirmSoftDelete(question: ClientRatingQuestion): void {
    if (!question?.RatingQuestionId) {
      this.toaster.show('Invalid record (missing ID)', 'error');
      return;
    }

    const updatedList = this.rowData.filter(
      (r) => r.RatingQuestionId !== question.RatingQuestionId
    );
    this.tabState.updateRatingQuestions(updatedList);
    this.rowData = updatedList;

    this.toaster.show('Item unlinked successfully', 'success');
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
  }
}
