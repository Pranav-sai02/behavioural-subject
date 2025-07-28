import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Client } from '../../models/Client';
import { Tab } from '../../models/tabs.enum';


@Injectable({ providedIn: 'root' })
export class TabStateService {
  private _selectedTab$ = new BehaviorSubject<Tab>(Tab.Details);
  readonly selectedTab$ = this._selectedTab$.asObservable();

  private _details$         = new BehaviorSubject<Partial<Client>>({});
  private _services$        = new BehaviorSubject<Partial<Client>>({});
  private _ratingQs$        = new BehaviorSubject<Partial<Client>>({});
  private _documents$       = new BehaviorSubject<Partial<Client>>({});
  private _claimCentre$     = new BehaviorSubject<Partial<Client>>({});
  private _serviceProv$     = new BehaviorSubject<Partial<Client>>({});
  private _claimController$ = new BehaviorSubject<Partial<Client>>({});

  setSelectedTab(tab: Tab): void {
    this._selectedTab$.next(tab);
  }

  getDetails(): Observable<Partial<Client>>         { return this._details$.asObservable(); }
  getServices(): Observable<Partial<Client>>        { return this._services$.asObservable(); }
  getRatingQuestions(): Observable<Partial<Client>> { return this._ratingQs$.asObservable(); }
  getDocuments(): Observable<Partial<Client>>       { return this._documents$.asObservable(); }
  getClaimCentre(): Observable<Partial<Client>>     { return this._claimCentre$.asObservable(); }
  getServiceProvider(): Observable<Partial<Client>> { return this._serviceProv$.asObservable(); }
  getClaimController(): Observable<Partial<Client>> { return this._claimController$.asObservable(); }

  updateDetails(patch: Partial<Client>): void {
    this._details$.next({ ...this._details$.value, ...patch });
  }
  updateServices(patch: Partial<Client>): void {
    this._services$.next({ ...this._services$.value, ...patch });
  }
  updateRatingQuestions(patch: Partial<Client>): void {
    this._ratingQs$.next({ ...this._ratingQs$.value, ...patch });
  }
  updateDocuments(patch: Partial<Client>): void {
    this._documents$.next({ ...this._documents$.value, ...patch });
  }
  updateClaimCentre(patch: Partial<Client>): void {
    this._claimCentre$.next({ ...this._claimCentre$.value, ...patch });
  }
  updateServiceProvider(patch: Partial<Client>): void {
    this._serviceProv$.next({ ...this._serviceProv$.value, ...patch });
  }
  updateClaimController(patch: Partial<Client>): void {
    this._claimController$.next({ ...this._claimController$.value, ...patch });
  }

  /**
   * Gather full Client by merging all slices
   */
  gatherFullClient(): Observable<Client> {
    return new Observable(observer => {
      forkJoin({
        d: this._details$.pipe(take(1)),
        s: this._services$.pipe(take(1)),
        r: this._ratingQs$.pipe(take(1)),
        doc: this._documents$.pipe(take(1)),
        cc: this._claimCentre$.pipe(take(1)),
        sp: this._serviceProv$.pipe(take(1)),
        ctr: this._claimController$.pipe(take(1))
      }).subscribe(parts => {
        const merged = { ...parts.d, ...parts.s, ...parts.r, ...parts.doc, ...parts.cc, ...parts.sp, ...parts.ctr };
        observer.next(merged as Client);
        observer.complete();
      });
    });
  }
}
