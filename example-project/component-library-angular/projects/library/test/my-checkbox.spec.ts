import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BooleanValueAccessor, MyCheckbox } from '../src/public-api';

@Component({
  template: ` <my-checkbox type="text" (ionChange)="changeTriggered()" [(ngModel)]="itemIsChecked"></my-checkbox>`,
  imports: [MyCheckbox, FormsModule, BooleanValueAccessor],
})
class TestBooleanValueAccessorComponent {
  itemIsChecked: boolean = false;
  changeTriggeredTimes: number = 0;

  changeTriggered(): void {
    this.changeTriggeredTimes++;
  }
}

describe('MyCheckbox', () => {
  let myCheckboxEl: DebugElement;
  let fixture: ComponentFixture<TestBooleanValueAccessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TestBooleanValueAccessorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestBooleanValueAccessorComponent);
    fixture.detectChanges();
    myCheckboxEl = fixture.debugElement.query(By.css('my-checkbox'));
  });

  it('ionChange updates the bound component attribute should update', () => {
    const { componentInstance: myAngularComponent } = fixture;
    myCheckboxEl.nativeElement.checked = true;
    myCheckboxEl.nativeElement.dispatchEvent(new CustomEvent('ionChange', { detail: { value: true } }));
    expect(myAngularComponent.itemIsChecked).toEqual(true);
  });

  it('should trigger output only once', () => {
    const { componentInstance: myAngularComponent } = fixture;
    myCheckboxEl.nativeElement.checked = true;
    myCheckboxEl.nativeElement.dispatchEvent(new CustomEvent('ionChange', { detail: { value: true } }));

    expect(myAngularComponent.changeTriggeredTimes).toEqual(1);
  });
});
