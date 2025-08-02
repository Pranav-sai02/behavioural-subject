// ratingQuestionOptions.ts

export interface RatingQuestionType {
  RatingQuestionTypeId: number;
  QuestionType: string;
}

export interface RatingQuestionOption {
  RatingQuestionOptionId: number;
  RatingQuestionTypeId: number;
  RatingQuestionType: RatingQuestionType;
  QuestionOption: string;
  IsNoteRequired: boolean;
  IsActive: boolean;
  DoRaiseFlag: boolean;
  QualifyingPrompt: string;
  RatingValue: number;

  IsDeleted?: boolean;
}
