import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RatingQuestionType } from '../../models/RatingQuestionOption';
import { RatingQuestionTypeService } from '../../../rating-questions-types/services/rating-question-types.service';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';


@Component({
  selector: 'app-rating-questions-options-popup',
  standalone: false,
  templateUrl: './rating-questions-options-popup.component.html',
  styleUrl: './rating-questions-options-popup.component.css',
})
export class RatingQuestionsOptionsPopupComponent {
  @Input() initialData?: any;
  @Input() isEditMode: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  providerForm!: FormGroup;
  questionTypes: RatingQuestionType[] = []; // loaded internally

  constructor(
    private fb: FormBuilder,
    private ratingQuestionTypeService: RatingQuestionTypeService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRatingQuestionTypes();
  }

  initForm(): void {
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
      this.providerForm.patchValue({
        RatingQuestionTypeId:
          this.initialData?.RatingQuestionType?.RatingQuestionTypeId || '',
        QuestionOption: this.initialData?.QuestionOption || '',
        QualifyingPrompt: this.initialData?.QualifyingPrompt || '',
        RatingValue: this.initialData?.RatingValue || '',
        IsNoteRequired: this.initialData?.IsNoteRequired || false,
        DoRaiseFlag: this.initialData?.DoRaiseFlag || false,
        IsActive: this.initialData?.IsActive || false,
      });
    }
  }

  loadRatingQuestionTypes(): void {
    this.ratingQuestionTypeService.getRatingQuestionTypes().subscribe({
      next: (data) => {
        this.questionTypes = data;
      },
      error: () => {
        this.toaster.show('Failed to load question types', 'error');
      },
    });
  }

  onSubmit(): void {
    console.log('Form Value on Submit', this.providerForm.value);

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
