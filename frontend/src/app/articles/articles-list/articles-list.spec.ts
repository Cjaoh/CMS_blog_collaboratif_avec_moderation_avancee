import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesList } from './articles-list';

describe('ArticlesList', () => {
  let component: ArticlesList;
  let fixture: ComponentFixture<ArticlesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticlesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
