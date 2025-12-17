import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamGenerator } from './team-generator';

describe('TeamGenerator', () => {
  let component: TeamGenerator;
  let fixture: ComponentFixture<TeamGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
