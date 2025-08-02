// models/rating-question.model.ts

export interface RatingQuestionType {
  RatingQuestionTypeId: number;
  QuestionType: string;
}

export interface RatingQuestion {
  RatingQuestionId?: number; // optional for creation
  RatingQuestionTypeId: number;
  RatingQuestionType?: RatingQuestionType;
  Question: string;
  IsActive: boolean;
  ListRank: number;
  IsDeleted?: boolean;
}
