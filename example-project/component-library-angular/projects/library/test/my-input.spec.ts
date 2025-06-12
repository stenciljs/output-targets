import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MyInput, TextValueAccessor } from '../src/public-api';

@Component({
  template: ` <my-input type="text" [(ngModel)]="testText" (myInput)="onInput($event.target.value)"></my-input>`,
  imports: [MyInput, TextValueAccessor, FormsModule],
})
class TestTextValueAccessorComponent {
  testText: string = '';

  onInput() {}
}

describe('MyInput - Text Value', () => {
  let myInputEl: DebugElement;
  let fixture: ComponentFixture<TestTextValueAccessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TestTextValueAccessorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTextValueAccessorComponent);
    fixture.detectChanges();
    myInputEl = fixture.debugElement.query(By.css('my-input'));
  });

  it('on myChange type="text" the bound component attribute should update', () => {
    const { componentInstance: myAngularComponent } = fixture;
    myInputEl.nativeElement.value = 'text';
    myInputEl.nativeElement.dispatchEvent(new CustomEvent('myChange', { detail: { value: 'text' } }));
    expect(myAngularComponent.testText).toEqual('text');
  });

  it('myInput event should call local method', () => {
    const { componentInstance: myAngularComponent } = fixture;
    const fakeOnInput = jest.fn();
    myAngularComponent.onInput = fakeOnInput;
    myInputEl.triggerEventHandler('myInput', { target: { value: 'fired' } });

    expect(fakeOnInput).toHaveBeenCalledTimes(1);
    expect(fakeOnInput).toHaveBeenCalledWith('fired');
  });
});

@Component({
  template: ` <my-input type="number" [(ngModel)]="testNumber"></my-input>`,
  imports: [FormsModule, MyInput],
})
class TestNumberValueAccessorComponent {
  testNumber: number = 0;
}

describe('MyInput - Number Value', () => {
  let myInputEl: DebugElement;
  let fixture: ComponentFixture<TestNumberValueAccessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TestNumberValueAccessorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestNumberValueAccessorComponent);
    fixture.detectChanges();
    myInputEl = fixture.debugElement.query(By.css('my-input'));
  });

  it('should update value to number on myInputEvent', () => {
    const { componentInstance: myAngularComponent } = fixture;
    myInputEl.nativeElement.value = 50;
    myInputEl.nativeElement.dispatchEvent(new CustomEvent('myInput', { detail: { value: 50 } }));
    expect(myAngularComponent.testNumber).toEqual(50);
  });
});

@Component({
  template: ` <form [formGroup]="form">
    <my-input type="text" formControlName="test"></my-input>
  </form>`,
  imports: [MyInput, ReactiveFormsModule, TextValueAccessor],
})
class TestDisabledValueAccessorComponent {
  
  form = this.formBuilder.group({
    // disabled state will be managed for us by angular
    // and now we can later call `this.form.controls.test.enable()`
    test: this.formBuilder.control({ value: 'test', disabled: true }),
  });

  constructor(private formBuilder: FormBuilder) {}
}

describe('MyInput - Disabled state', () => {
  let myInputEl: DebugElement;
  let fixture: ComponentFixture<TestDisabledValueAccessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, TestDisabledValueAccessorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDisabledValueAccessorComponent);
    fixture.detectChanges();
    myInputEl = fixture.debugElement.query(By.css('my-input'));
  });

  it('should support setting disabled state via the ValueAccessor', () => {
    expect(myInputEl.nativeElement.disabled).toBe(true);
  });
});
