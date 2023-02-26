import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  ReplaySubject,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import { FindFalconeResponse } from '../models';
import { FalconeService } from '../services/falcone.service';

@Component({
  selector: 'app-falcone-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent implements OnInit, OnDestroy {
  statusMessage: string = '';
  timeTaken$ = this.route.queryParams;
  error = false;
  destroyed$: ReplaySubject<void> = new ReplaySubject<void>(1);
  findingFalcone = true;

  constructor(
    readonly falconeService: FalconeService,
    readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.falconeService
      .getSelectedLaunchItems()
      .pipe(
        switchMap((res) => this.falconeService.findFalcone(res)),
        catchError((error: HttpErrorResponse) => throwError(() => error)),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (res: FindFalconeResponse) => {
          if (res.status && res.status === 'success') {
            this.statusMessage = res.planet_name as string;
          } else if (res.error) {
            this.error = true;
            this.statusMessage = res.error;
          } else {
            this.error = true;
            this.statusMessage =
              'Falcone not found on either planet, please try again with new search';
          }
          this.findingFalcone = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = true;
          this.statusMessage =
            'Ummm!! Some unexpected error occurred, please give another try.';
          this.findingFalcone = false;
          if (err.message) {
            this.statusMessage = err.message;
          }
        },
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(undefined);
    this.destroyed$.complete();
  }
}
