import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditdeviceComponent } from './editdevice.component';

describe('EditdeviceComponent', () => {
  let component: EditdeviceComponent;
  let fixture: ComponentFixture<EditdeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditdeviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditdeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
