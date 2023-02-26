import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FindFalconeResponse, Planet, Token, Vehicle } from '../models';
import { LaunchItem } from '../models/launch-items';

@Injectable({
  providedIn: 'root',
})
export class FalconeService {
  private BASE_URL = 'https://findfalcone.herokuapp.com';

  private PLANETS_URL = `${this.BASE_URL}/planets`;
  private VEHICLES_URL = `${this.BASE_URL}/vehicles`;
  private TOKEN_URL = `${this.BASE_URL}/token`;
  private FIND_FALCONE_URL = `${this.BASE_URL}/find`;

  private sourceSelection = new BehaviorSubject({});

  constructor(private http: HttpClient) {}

  getPlanets(): Observable<Planet[]> {
    return this.http.get(this.PLANETS_URL).pipe(
      map((res) => res as Planet[]),
      catchError((err) => this.catchHttpError(err))
    );
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get(this.VEHICLES_URL).pipe(
      map((res) => res as Vehicle[]),
      catchError((err) => this.catchHttpError(err))
    );
  }

  getToken(): Observable<Token> {
    return this.http.post(this.TOKEN_URL, null).pipe(
      map((res) => res as Token),
      catchError((err) => this.catchHttpError(err))
    );
  }

  findFalcone(requestData: LaunchItem): Observable<FindFalconeResponse> {
    return this.http.post(this.FIND_FALCONE_URL, requestData).pipe(
      map((res) => res as FindFalconeResponse),
      catchError((err) => this.catchHttpError(err))
    );
  }

  getSelectedLaunchItems() {
    return this.sourceSelection.asObservable();
  }
  setSelectedLaunchItems(item: LaunchItem) {
    this.sourceSelection.next(item);
  }
  private catchHttpError(err: HttpErrorResponse): Observable<never> {
    return throwError(() => err.error);
  }
}
