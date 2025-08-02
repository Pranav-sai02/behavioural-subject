import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  RatingQuestion,
  RatingQuestionType,
} from '../../models/rating-questions.model';

import { RatingQuestionTypeService } from '../../../rating-questions-types/services/rating-question-types.service';
import { RatingQuestionService } from '../../services/rating-questions.service';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';

@Component({
  selector: 'app-rating-questions-list-popup',
  standalone: false,
  templateUrl: './rating-questions-list-popup.component.html',
  styleUrls: ['./rating-questions-list-popup.component.css'],
})
export class RatingQuestionsListPopupComponent implements OnInit {
  @Input() initialData?: RatingQuestion | null;
  @Input() isEditMode = false;
  @Input() questionTypes: RatingQuestionType[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  providerForm!: FormGroup;
  questionList: RatingQuestion[] = [];

  constructor(
    private fb: FormBuilder,
    private ratingQuestionTypeService: RatingQuestionTypeService,
    private ratingQuestionService: RatingQuestionService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRatingQuestionTypes();
  }

  private initForm(): void {
    this.providerForm = this.fb.group({
      RatingQuestionTypeId: ['', Validators.required],
      Question: ['', Validators.required],
      ListRank: ['', Validators.required],
      IsActive: [false],
    });

    if (this.initialData) {
      this.patchFormData();
    }
  }

  private patchFormData(): void {
    const data = this.initialData!;
    this.providerForm.patchValue({
      RatingQuestionTypeId: data?.RatingQuestionType?.RatingQuestionTypeId ?? '',
      Question: data?.Question ?? '',
      ListRank: data?.ListRank ?? '',
      IsActive: data?.IsActive ?? false,
    });
  }

  private loadRatingQuestionTypes(): void {
    this.ratingQuestionTypeService.getAll().subscribe({
      next: (data) => {
        this.questionTypes = data;
      },
      error: () => {
        this.toaster.show('Failed to load question types', 'error');
      },
    });
  }

  onSubmit(): void {
    if (this.providerForm.valid) {
      this.submit.emit(this.providerForm.value);
    } else {
      this.providerForm.markAllAsTouched();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
