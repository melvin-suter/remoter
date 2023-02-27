import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialInfoComponent } from './credential-info.component';

describe('CredentialInfoComponent', () => {
  let component: CredentialInfoComponent;
  let fixture: ComponentFixture<CredentialInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CredentialInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
