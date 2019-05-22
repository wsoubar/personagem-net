import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPersonagemComponent } from './edit-personagem.component';

describe('EditPersonagemComponent', () => {
  let component: EditPersonagemComponent;
  let fixture: ComponentFixture<EditPersonagemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPersonagemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPersonagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
