import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugElement, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MyRadio, MyRadioGroup, SelectValueAccessor } from '../src/public-api';


@Component({
  template: ` <my-radio-group name="" [(ngModel)]="selectedName">
    <label>
      <my-radio slot="start" value="biff"></my-radio>
    </label>
    <label>
      <my-radio slot="start" value="griff"></my-radio>
    </label>
    <label>
      <my-radio slot="start" value="buford"></my-radio>
    </label>
  </my-radio-group>`,
  imports: [MyRadioGroup, MyRadio, SelectValueAccessor, FormsModule],
})
class TestRadioValueAccessorComponent {
  selectedName: 'biff' | 'griff' | 'buford' = 'biff';
}

describe('MyRadioGroup', () => {
  let myRadioGroupEl: DebugElement;
  let fixture: ComponentFixture<TestRadioValueAccessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TestRadioValueAccessorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestRadioValueAccessorComponent);
    fixture.detectChanges();
    myRadioGroupEl = fixture.debugElement.query(By.css('my-radio-group'));
  });

  it('on myChange value the bound component attribute should update', () => {
    const { componentInstance: myAngularComponent } = fixture;
    myRadioGroupEl.nativeElement.value = 'buford';
    myRadioGroupEl.nativeElement.dispatchEvent(new CustomEvent('myChange', { detail: { value: 'buford' } }));
    expect(myAngularComponent.selectedName).toEqual('buford');
  });
});
