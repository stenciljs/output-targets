import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MyToggleContent } from '../src/public-api';

@Component({
  template: '<my-toggle-content visible (my-kebab-event)="receiveEvent($event)"></my-toggle-content>',
  imports: [MyToggleContent],
})
class TestToggleContentComponent {
  eventReceived: Event | undefined;
  eventCount = 0;

  receiveEvent(event: Event): void {
    this.eventReceived = event;
    this.eventCount++;
  }
}

describe('MyToggleContent', () => {
  let fixture: ComponentFixture<TestToggleContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestToggleContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestToggleContentComponent);
    fixture.detectChanges();
  });

  it('binds a hyphenated event once and preserves the CustomEvent', () => {
    const component = fixture.componentInstance;
    const element = fixture.debugElement.query(By.css('my-toggle-content')).nativeElement;
    const event = new CustomEvent('my-kebab-event', { detail: 'clicked' });

    element.dispatchEvent(event);

    expect(component.eventCount).toBe(1);
    expect(component.eventReceived).toBe(event);
    expect(component.eventReceived).toBeInstanceOf(CustomEvent);
    expect((component.eventReceived as CustomEvent<string>).detail).toBe('clicked');
  });
});
