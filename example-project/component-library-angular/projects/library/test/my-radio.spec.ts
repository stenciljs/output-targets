import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugElement, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MyRadio, RadioValueAccessor } from '../src/public-api';


@Component({
  template: ` <my-radio [(ngModel)]="isChecked"></my-radio>`,
  imports: [MyRadio, RadioValueAccessor, FormsModule],
})
class TestRadioValueAccessorComponent {
  isChecked: boolean = false;
}

describe('MyRadio', () => {
  let myRadioEl: DebugElement;
  let fixture: ComponentFixture<TestRadioValueAccessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TestRadioValueAccessorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestRadioValueAccessorComponent);
    fixture.detectChanges();
    myRadioEl = fixture.debugElement.query(By.css('my-radio'));
  });

  it('on mySelect checked the bound component attribute should update', () => {
    const { componentInstance: myAngularComponent } = fixture;
    myRadioEl.nativeElement.checked = true;
    myRadioEl.nativeElement.dispatchEvent(new CustomEvent('mySelect', { detail: { checked: true } }));
    expect(myAngularComponent.isChecked).toEqual(true);
  });
});
