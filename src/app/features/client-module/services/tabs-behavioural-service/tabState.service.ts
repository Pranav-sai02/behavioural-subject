import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { 
  Client, ClientService, ClientDocument, ClientClaimCentre, 
  ClientClaimController, ClientServiceProvider, ClientRatingQuestion 
} from '../../models/Client';
import { Tab } from '../../models/tabs.enum';

@Injectable({ providedIn: 'root' })
export class TabStateService {
 private _selectedTab$ = new BehaviorSubject<Tab>(Tab.Details);
  readonly selectedTab$ = this._selectedTab$.asObservable();

  // **Tab 7 (Company & Details via Accordions)**
  private _details$ = new BehaviorSubject<Partial<Client>>({});

  // **Tabs 1–6 (Collections)**
  private _services$        = new BehaviorSubject<ClientService[]>([]);
  private _ratingQs$        = new BehaviorSubject<ClientRatingQuestion[]>([]);
  private _documents$       = new BehaviorSubject<ClientDocument[]>([]);
  private _claimCentre$     = new BehaviorSubject<ClientClaimCentre[]>([]);
  private _serviceProv$     = new BehaviorSubject<ClientServiceProvider[]>([]);
  private _claimController$ = new BehaviorSubject<ClientClaimController[]>([]);

  /** ---------------------
   * Tab selection
   * --------------------- */
  setSelectedTab(tab: Tab): void {
    this._selectedTab$.next(tab);
  }

  /** ---------------------
   * Getters (Observables)
   * --------------------- */
  getDetails()         { return this._details$.asObservable(); }
  getServices()        { return this._services$.asObservable(); }
  getRatingQuestions() { return this._ratingQs$.asObservable(); }
  getDocuments()       { return this._documents$.asObservable(); }
  getClaimCentre()     { return this._claimCentre$.asObservable(); }
  getServiceProvider() { return this._serviceProv$.asObservable(); }
  getClaimController() { return this._claimController$.asObservable(); }

  /** ---------------------
   * Updaters
   * --------------------- */
  updateDetails(details: Partial<Client>): void {
    this._details$.next({ ...this._details$.value, ...details });
  }

  updateServices(services: ClientService[]): void {
    this._services$.next([...services]);
  }

  updateRatingQuestions(ratingQs: ClientRatingQuestion[]): void {
    this._ratingQs$.next([...ratingQs]);
  }

  updateDocuments(docs: ClientDocument[]): void {
    this._documents$.next([...docs]);
  }

  updateClaimCentre(centres: ClientClaimCentre[]): void {
    this._claimCentre$.next([...centres]);
  }

  updateServiceProvider(providers: ClientServiceProvider[]): void {
    this._serviceProv$.next([...providers]);
  }

  updateClaimController(controllers: ClientClaimController[]): void {
    this._claimController$.next([...controllers]);
  }

  /** ---------------------
   * Merge all state slices into a single Client object
   * --------------------- */
  gatherFullClient(): Observable<Client> {
    return forkJoin({
      details: this._details$.pipe(take(1)),
      services: this._services$.pipe(take(1)),
      ratingQs: this._ratingQs$.pipe(take(1)),
      documents: this._documents$.pipe(take(1)),
      claimCentre: this._claimCentre$.pipe(take(1)),
      serviceProv: this._serviceProv$.pipe(take(1)),
      claimController: this._claimController$.pipe(take(1))
    }).pipe(
      map(({ details, services, ratingQs, documents, claimCentre, serviceProv, claimController }) => {
        const baseDetails = this.applyDefaults(details); // Add defaults for required fields
        return {
          ...baseDetails,
          ClientService: services,
          ClientRatingQuestion: ratingQs,
          clientDocument: documents,
          ClientClaimCentre: claimCentre,
          ClientServiceProvider: serviceProv,
          ClientClaimController: claimController
        } as Client;
      })
    );
  }

  /** ---------------------
   * Default fallback for required fields
   * --------------------- */
  private applyDefaults(details: Partial<Client>): Partial<Client> {
    return {
      ClientId: details.ClientId ?? 0,
      ClientName: details.ClientName ?? '',
      PrintName: details.PrintName ?? '',
      ClientGroupId: details.ClientGroupId ?? 0,
      ClientGroup: details.ClientGroup ?? { ClientGroupId: 0, Name: '', IsActive: true },
      Tel: details.Tel ?? '',
      Mobile: details.Mobile ?? '',
      IsActive: details.IsActive ?? true,
      ...details
    };
  }

  /** ---------------------
   * Debugging Helper
   * --------------------- */
  logCurrentState(): void {
    console.log('Details:', this._details$.value);
    console.log('Services:', this._services$.value);
    console.log('RatingQs:', this._ratingQs$.value);
    console.log('Documents:', this._documents$.value);
    console.log('ClaimCentre:', this._claimCentre$.value);
    console.log('ServiceProvider:', this._serviceProv$.value);
    console.log('ClaimController:', this._claimController$.value);
  }
}
