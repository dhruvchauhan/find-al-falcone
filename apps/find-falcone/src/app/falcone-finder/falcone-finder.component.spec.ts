import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FalconeService } from '../services/falcone.service';

import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { render, within } from '@testing-library/angular';
import { fireEvent, screen } from '@testing-library/dom';
import { createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { FalconeFinderComponent } from './falcone-finder.component';
import { FalconFinderModule } from './falcone-finder.module';

describe('FalconeFinderComponent', () => {
  const MOCK_PLANETS = [
    { name: 'Donlon', distance: 100 },
    { name: 'Enchai', distance: 200 },
    { name: 'Jebing', distance: 300 },
    { name: 'Sapir', distance: 400 },
    { name: 'Lerbin', distance: 500 },
    { name: 'Pingasor', distance: 600 },
  ];
  const MOCK_VEHICLES = [
    { name: 'Space pod', total_no: 2, max_distance: 200, speed: 2 },
    { name: 'Space rocket', total_no: 1, max_distance: 300, speed: 4 },
    { name: 'Space shuttle', total_no: 1, max_distance: 400, speed: 5 },
    { name: 'Space ship', total_no: 2, max_distance: 600, speed: 10 },
  ];

  async function setup({ hasError = false }: { hasError?: boolean }) {
    const falconeServiceSpy = createSpyFromClass(FalconeService);

    falconeServiceSpy.getPlanets.mockReturnValue(of(MOCK_PLANETS));
    falconeServiceSpy.getVehicles.mockReturnValue(of(MOCK_VEHICLES));
    if (hasError) {
      falconeServiceSpy.getToken.throwWith({ error: 'mock error' });
    } else {
      falconeServiceSpy.getToken.nextWith({ token: 'fake-token' });
    }

    const { fixture } = await render(FalconeFinderComponent, {
      imports: [
        FalconFinderModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: FalconeService, useValue: falconeServiceSpy }],
    });
    return {
      fixture,
      falconeServiceSpy,
    };
  }

  it('will call planets and vehicles service', async () => {
    const { falconeServiceSpy } = await setup({});
    expect(falconeServiceSpy.getPlanets).toHaveBeenCalled();
    expect(falconeServiceSpy.getVehicles).toHaveBeenCalled();
  });

  it('will call onPlanetChange', async () => {
    await setup({});
    const selectElements = screen.getAllByRole('combobox');
    const planetOptions = within(selectElements[0]).getAllByRole('option');
    fireEvent.change(planetOptions[1], 0);

    expect(screen.getAllByText(/Donlon/i)[0]).toBeVisible();
    expect(screen.getAllByText(/Space pod/i)[0]).toBeVisible();
  });

  it('will call onVehicleChange', async () => {
    await setup({});
    const selectElements = screen.getAllByRole('combobox');
    const planetOptions = within(selectElements[0]).getAllByRole('option');
    fireEvent.change(planetOptions[1], 0);
    const vehicleOptions = screen.getAllByRole('radio', {
      name: /Space/i,
    });
    vehicleOptions[0].click();

    expect(vehicleOptions[0]).toBeChecked();
  });

  it('will call findFalcone method, once token is returned and it will navigate to results page', async () => {
    const { falconeServiceSpy, fixture } = await setup({});
    const routerSpy = TestBed.inject(Router);
    jest.spyOn(routerSpy, 'navigate');
    for (let i = 0; i < 4; i++) {
      await selectFourPlanetsAndVehicles(i);
    }
    fixture.detectChanges();
    const findFalconeButton = await screen.getByRole('button', {
      name: /find falcone/i,
    });
    findFalconeButton.click();
    expect(falconeServiceSpy.getToken).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/results'], {
      queryParams: { timeTaken: 200 },
      queryParamsHandling: 'merge',
    });
  });
  it('will call findFalcone method; if token is not returned it will show error', async () => {
    const { falconeServiceSpy, fixture } = await setup({ hasError: true });
    for (let i = 0; i < 4; i++) {
      await selectFourPlanetsAndVehicles(i);
    }

    fixture.detectChanges();
    const findFalconeButton = screen.getByRole('button', {
      name: /find falcone/i,
    });
    findFalconeButton.click();
    expect(falconeServiceSpy.getToken).toHaveBeenCalled();
  });

  async function selectFourPlanetsAndVehicles(i: number) {
    const selectElements = screen.getAllByRole('combobox');
    const planetOptions = within(selectElements[i]).getAllByRole('option');
    fireEvent.change(planetOptions[1], i);
    const vehicleOptions = screen.getAllByRole('radio', {
      name: /Space/i,
    });
    vehicleOptions[i * 5].click();
  }
});
