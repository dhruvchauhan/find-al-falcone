import { HttpClient } from '@angular/common/http';
import { createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { FalconeService } from './falcone.service';

describe('FalconeService', () => {
  async function setup() {
    const mockHttpClient = createSpyFromClass(HttpClient);
    mockHttpClient.get.mockReturnValue(of({}));
    mockHttpClient.post.mockReturnValue(of({}));
    const falconeServiceMock = new FalconeService(mockHttpClient);

    return {
      mockHttpClient,
      falconeServiceMock,
    };
  }

  it('will call planets api', async () => {
    const { mockHttpClient, falconeServiceMock } = await setup();
    falconeServiceMock.getPlanets().subscribe();
    expect(mockHttpClient.get).toHaveBeenCalled();
  });

  it('will call vehicles api', async () => {
    const { mockHttpClient, falconeServiceMock } = await setup();
    falconeServiceMock.getVehicles().subscribe();
    expect(mockHttpClient.get).toHaveBeenCalled();
  });

  it('will call token api', async () => {
    const { mockHttpClient, falconeServiceMock } = await setup();
    falconeServiceMock.getToken().subscribe();
    expect(mockHttpClient.post).toHaveBeenCalled();
  });

  it('will call findFalcone api', async () => {
    const { mockHttpClient, falconeServiceMock } = await setup();
    falconeServiceMock.findFalcone({}).subscribe();
    expect(mockHttpClient.post).toHaveBeenCalled();
  });
});
