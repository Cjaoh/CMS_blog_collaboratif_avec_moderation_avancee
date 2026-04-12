import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesDetail } from './articles-detail';

describe('ArticlesDetail', () => {
  let component: ArticlesDetail;
  let fixture: ComponentFixture<ArticlesDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticlesDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
