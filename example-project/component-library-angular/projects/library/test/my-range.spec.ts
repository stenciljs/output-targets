import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugElement, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MyRange, SelectValueAccessor } from '../src/public-api';


@Component({
  template: `<my-range min="0" max="100" type="text" [(ngModel)]="testText"></my-range>`,
  imports: [MyRange, SelectValueAccessor, FormsModule],
})
class TestSelectValueAccessorComponent {
  testText: string = '';
}

describe('MyRange', () => {
  let myRangeEl: DebugElement;
  let fixture: ComponentFixture<TestSelectValueAccessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TestSelectValueAccessorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestSelectValueAccessorComponent);
    fixture.detectChanges();
    myRangeEl = fixture.debugElement.query(By.css('my-range'));
  });

  it('on myChange value the bound component attribute should update', () => {
    const { componentInstance: myAngularComponent } = fixture;
    myRangeEl.nativeElement.value = 50;
    myRangeEl.nativeElement.dispatchEvent(new CustomEvent('myChange', { detail: { value: 50 } }));
    expect(myAngularComponent.testText).toEqual(50);
  });
});
