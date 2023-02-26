import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';
import { screen } from '@testing-library/dom';

import { WelcomeComponent } from './welcome.component';
import { WelcomeModule } from './welcome.module';

describe('WelcomeComponent', () => {
  async function setup() {
    await render(WelcomeComponent, {
      imports: [WelcomeModule, RouterTestingModule],
    });
    return {};
  }

  it('will show button and redirect to start mission', async () => {
    await setup();
    const routerSpy = TestBed.inject(Router);
    jest.spyOn(routerSpy, 'navigateByUrl');
    const button = await screen.getByRole('button', { name: /Start Mission/i });
    button.click();
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
  });
});
