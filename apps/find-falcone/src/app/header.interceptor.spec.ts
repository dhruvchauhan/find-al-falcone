import { HttpHandler, HttpRequest } from '@angular/common/http';
import { createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';

import { HeaderInterceptor } from './header.interceptor';

describe('HeaderInterceptor', () => {
  async function setup() {
    const mockHttpHeaders = {};
    const mockHttpRequest = createSpyFromClass(HttpRequest);
    mockHttpRequest.clone({ mockHttpHeaders });
    const mockHeaderInterceptor = new HeaderInterceptor();
    mockHeaderInterceptor.intercept = jest.fn().mockReturnValue(of({}));

    return {
      mockHttpRequest,
      mockHeaderInterceptor,
    };
  }

  it('interceptor service to be thruthy', async () => {
    const { mockHeaderInterceptor } = await setup();
    expect(mockHeaderInterceptor).toBeTruthy();
  });

  it('will call inctercept method for all requests', async () => {
    const { mockHeaderInterceptor, mockHttpRequest } = await setup();
    const mockHandler: HttpHandler = {
      handle: jest.fn(),
    };

    mockHttpRequest.clone('GET', '/find');
    mockHeaderInterceptor.intercept(mockHttpRequest, mockHandler).subscribe();
    expect(mockHeaderInterceptor.intercept).toHaveBeenCalled();
  });
});
