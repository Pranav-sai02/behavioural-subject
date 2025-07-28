import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceProviders } from '../../models/ServiceProviders';
import { catchError, Observable, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../../../constants/api-endpoints';
import { ToastrService } from '../../../../../shared/component/toastr/services/toastr.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceProvidersService {
  private apiUrl = API_ENDPOINTS.SERVICE_PROVIDERS;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  private handleError(operation = 'operation') {
    return (error: any): Observable<never> => {
      this.toastr.show(`Somthing went wrong during ${operation}.`, 'error');
      return throwError(() => error);
    };
  }

  getServiceProviders(): Observable<ServiceProviders[]> {
    return this.http
      .get<ServiceProviders[]>(this.apiUrl)
      .pipe(catchError(this.handleError('fetching all services')));
  }

  addServiceProvider(provider: ServiceProviders): Observable<ServiceProviders> {
    return this.http
      .post<ServiceProviders>(this.apiUrl, provider)
      .pipe(catchError(this.handleError(`creating serviceproviders`)));
  }

  updateServiceProvider(
    id: number,
    data: ServiceProviders
  ): Observable<ServiceProviders> {
    return this.http
      .put<ServiceProviders>(`${this.apiUrl}/${id}`, data)
      .pipe(catchError(this.handleError(`updating service provider ID ${id}`)));
  }

  deleteServiceProvider(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError(`deleting service provider ID ${id}`)));
  }

  softDeleteServiceProvider(id: number): Observable<ServiceProviders> {
    return this.http.put<ServiceProviders>(`${this.apiUrl}/${id}/softdelete`, {
      IsDelete: true,
    });
  }
}
