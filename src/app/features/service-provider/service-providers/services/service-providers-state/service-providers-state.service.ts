import { Injectable } from '@angular/core';
import { ServiceProviders } from '../../models/ServiceProviders';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceProvidersStateService {
  private linkedProvidersSubject = new BehaviorSubject<ServiceProviders[]>([]);
  linkedProviders$ = this.linkedProvidersSubject.asObservable();

  constructor() {}

  setLinkedProviders(providers: ServiceProviders[]): void {
    this.linkedProvidersSubject.next(providers);
  }

  getLinkedProviders(): ServiceProviders[] {
    return this.linkedProvidersSubject.getValue();
  }

  addProvider(provider: ServiceProviders): void {
    const current = this.getLinkedProviders();
    this.linkedProvidersSubject.next([...current, provider]);
  }

  removeProvider(id: number): void {
    const filtered = this.getLinkedProviders().filter(
      (p) => p.ServiceProviderId !== id
    );
    this.linkedProvidersSubject.next(filtered);
  }

  clear(): void {
    this.linkedProvidersSubject.next([]);
  }
}
