import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  styleUrl: './rating-questions-list-popup.component.css',
})
export class RatingQuestionsListPopupComponent {
  @Input() initialData?: any;
  @Input() isEditMode: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  providerForm!: FormGroup;
  questionlist: RatingQuestion[] = []; // loaded internally
  @Input() questionTypes: RatingQuestionType[] = [];

  constructor(
    private fb: FormBuilder,
    private ratingQuestionTypeService: RatingQuestionTypeService,
    private ratingQuestionservice: RatingQuestionService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRatingQuestionTypes();
  }

  initForm(): void {
    this.providerForm = this.fb.group({
      RatingQuestionTypeId: ['', Validators.required],
      Question: ['', Validators.required],
      ListRank: ['', Validators.required],
      IsActive: [false],
    });

    if (this.initialData) {
      this.providerForm.patchValue({
        RatingQuestionTypeId:
          this.initialData?.RatingQuestionType?.RatingQuestionTypeId || '',
        Question: this.initialData?.Question || '',
        ListRank: this.initialData?.ListRank || '',
        IsActive: this.initialData?.IsActive || false,
      });
    }
  }

  loadRatingQuestionTypes(): void {
    this.ratingQuestionTypeService.getRatingQuestionTypes().subscribe({
      next: (data: RatingQuestionType[]) => {
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
