import { FalconeService } from '../services/falcone.service';

import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';
import { LaunchItem } from '../models';
import { ResultsComponent } from './results.component';
import { ResultsModule } from './results.module';

import { createSpyFromClass } from 'jest-auto-spies';

describe('ResultsComponent', () => {
  const LAUNCH_ITEM_MOCK: LaunchItem = {
    token: 'fake-token-value',
    planet_names: ['Domlon', 'Enchai'],
    vehicle_names: ['Space pod', 'Space ship'],
  };
  async function setup() {
    const falconeServiceSpy = createSpyFromClass(FalconeService, {
      methodsToSpyOn: ['findFalcone'],
    });

    falconeServiceSpy.getSelectedLaunchItems.nextWith(LAUNCH_ITEM_MOCK);
    falconeServiceSpy.findFalcone.mockReturnValue(
      of({
        status: 'success',
        planet_name: 'Domlon',
      })
    );
    await render(ResultsComponent, {
      imports: [ResultsModule, RouterTestingModule],
      providers: [
        {
          provide: FalconeService,
          useValue: falconeServiceSpy,
        },
      ],
    });
    return {
      falconeServiceSpy,
    };
  }

  it('should call findFalcone', async () => {
    const { falconeServiceSpy } = await setup();
    expect(falconeServiceSpy.getSelectedLaunchItems).toHaveBeenCalled();
    expect(falconeServiceSpy.findFalcone).toHaveBeenCalledWith(
      LAUNCH_ITEM_MOCK
    );
  });
});
