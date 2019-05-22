import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPersonagemComponent } from './add-personagem.component';

describe('AddPersonagemComponent', () => {
  let component: AddPersonagemComponent;
  let fixture: ComponentFixture<AddPersonagemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPersonagemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPersonagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
