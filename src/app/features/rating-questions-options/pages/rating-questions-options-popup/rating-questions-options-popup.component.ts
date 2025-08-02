import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RatingQuestionType } from '../../models/RatingQuestionOption';
import { RatingQuestionTypeService } from '../../../rating-questions-types/services/rating-question-types.service';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';

@Component({
  selector: 'app-rating-questions-options-popup',
  standalone: false,
  templateUrl: './rating-questions-options-popup.component.html',
  styleUrls: ['./rating-questions-options-popup.component.css'],
})
export class RatingQuestionsOptionsPopupComponent implements OnInit {
  @Input() initialData?: any;
  @Input() isEditMode = false;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  providerForm!: FormGroup;
  questionTypes: RatingQuestionType[] = [];

  constructor(
    private fb: FormBuilder,
    private ratingQuestionTypeService: RatingQuestionTypeService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRatingQuestionTypes();
  }

  private initForm(): void {
    this.providerForm = this.fb.group({
      RatingQuestionTypeId: ['', Validators.required],
      QuestionOption: ['', Validators.required],
      QualifyingPrompt: [''],
      RatingValue: ['', Validators.required],
      IsNoteRequired: [false],
      DoRaiseFlag: [false],
      IsActive: [false],
    });

    if (this.initialData) {
      this.patchFormData();
    }
  }

  private patchFormData(): void {
    const data = this.initialData;
    this.providerForm.patchValue({
      RatingQuestionTypeId: data?.RatingQuestionType?.RatingQuestionTypeId ?? '',
      QuestionOption: data?.QuestionOption ?? '',
      QualifyingPrompt: data?.QualifyingPrompt ?? '',
      RatingValue: data?.RatingValue ?? '',
      IsNoteRequired: data?.IsNoteRequired ?? false,
      DoRaiseFlag: data?.DoRaiseFlag ?? false,
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
