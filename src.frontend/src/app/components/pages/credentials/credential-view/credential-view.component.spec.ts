import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialViewComponent } from './credential-view.component';

describe('CredentialViewComponent', () => {
  let component: CredentialViewComponent;
  let fixture: ComponentFixture<CredentialViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CredentialViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
