import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RatingQuestionType } from '../models/rating-question-types.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { LoggerService } from '../../../core/services/logger/logger.service';

@Injectable({ providedIn: 'root' })
export class RatingQuestionTypeService {
   private readonly apiUrl = API_ENDPOINTS.CONFIG_RATING_QUESTIONS_TYPES;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  /** Get all rating question types */
  getAll(): Observable<RatingQuestionType[]> {
    return this.http
      .get<RatingQuestionType[]>(this.apiUrl)
      .pipe(catchError(error => this.handleError(error, 'getAll')));
  }

  /** Create a new rating question type */
  create(data: RatingQuestionType): Observable<RatingQuestionType> {
    return this.http
      .post<RatingQuestionType>(this.apiUrl, data)
      .pipe(catchError(error => this.handleError(error, 'create')));
  }

  /** Update a rating question type by ID */
  update(id: number, data: Partial<RatingQuestionType>): Observable<RatingQuestionType> {
    return this.http
      .put<RatingQuestionType>(`${this.apiUrl}/${id}`, data)
      .pipe(catchError(error => this.handleError(error, 'update')));
  }

  /** Soft-delete a rating question type */
  softDelete(id: number): Observable<RatingQuestionType> {
    return this.http
      .patch<RatingQuestionType>(`${this.apiUrl}/${id}`, { IsDeleted: true })
      .pipe(catchError(error => this.handleError(error, 'softDelete')));
  }

  /** Handle HTTP errors with logging */
  private handleError(error: HttpErrorResponse, methodName: string): Observable<never> {
    this.logger.logError(error, `RatingQuestionTypeService.${methodName}`);
    return throwError(() => error);
  }
}
