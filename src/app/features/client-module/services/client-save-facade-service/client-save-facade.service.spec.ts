import { TestBed } from '@angular/core/testing';

import { ClientSaveFacadeService } from './client-save-facade.service';

describe('ClientSaveFacadeService', () => {
  let service: ClientSaveFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientSaveFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
