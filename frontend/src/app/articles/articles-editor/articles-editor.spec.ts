import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesEditor } from './articles-editor';

describe('ArticlesEditor', () => {
  let component: ArticlesEditor;
  let fixture: ComponentFixture<ArticlesEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticlesEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
