export interface RatingQuestionType {
  RatingQuestionTypeId: number;
  QuestionType: string;
  IncludeInRatingCalcs: boolean;
  IsActive: boolean;
  IsDeleted?: boolean;
  IsEdited?: boolean; // for local UI tracking
}
