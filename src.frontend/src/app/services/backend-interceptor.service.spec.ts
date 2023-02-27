import { TestBed } from '@angular/core/testing';

import { BackendInterceptorService } from './backend-interceptor.service';

describe('BackendInterceptorService', () => {
  let service: BackendInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
