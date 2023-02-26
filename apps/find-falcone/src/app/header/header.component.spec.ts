import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { HeaderModule } from './header.module';

import { render, screen } from '@testing-library/angular';
describe('HeaderComponent', () => {
  async function setup() {
    await render(HeaderComponent, {
      imports: [HeaderModule, RouterTestingModule],
    });
  }

  it('should have two links to navigate', async () => {
    await setup();
    const linkReset = screen.getByText(/Reset/i);
    const linkHome = screen.getByText(/Home/i);

    expect(linkReset).toBeVisible();
    expect(linkHome).toBeVisible();
  });
});
