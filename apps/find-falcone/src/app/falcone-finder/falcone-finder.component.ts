import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  EMPTY,
  Observable,
  ReplaySubject,
  takeUntil,
  tap,
} from 'rxjs';
import { Planet, Token, Vehicle } from '../models';
import { FalconeService } from '../services/falcone.service';

@Component({
  selector: 'app-finding-falcone',
  templateUrl: './falcone-finder.component.html',
  styleUrls: ['./falcone-finder.component.scss'],
})
export class FalconeFinderComponent implements OnInit, OnDestroy {
  readonly destroyed$: ReplaySubject<void> = new ReplaySubject<void>(1);
  readonly totalVehicles: number[] = [1, 2, 3, 4];
  readonly planets$: Observable<Planet[]> = this.falconeService.getPlanets();
  readonly vehicles$: Observable<Vehicle[]> = this.falconeService.getVehicles();

  totalTimeTaken: number = 0;
  errorMessage: string = '';

  originalPlanets: Planet[] = [];
  originalVehicles: Vehicle[] = [];
  planets: Planet[] = [];
  vehicles: Vehicle[] = [];

  selectedPlanets: string[] = [];
  selectedVehicles: Vehicle[] = [];

  constructor(
    readonly falconeService: FalconeService,
    readonly route: Router
  ) {}

  ngOnInit(): void {
    this.planets$
      .pipe(
        tap((response: Planet[]) => {
          this.originalPlanets = [...response];
          this.planets = [...response];
        }),
        catchError((error: unknown) => this.apiErrorHandler(error)),
        takeUntil(this.destroyed$)
      )
      .subscribe();

    this.vehicles$
      .pipe(
        tap((response: Vehicle[]) => {
          this.originalVehicles = [...response];
          this.vehicles = [...response];
        }),
        catchError((error: unknown) => this.apiErrorHandler(error)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onPlanetChange(event: Event, index: number): void {
    const selectedPlanet = (event.target as HTMLInputElement).value;
    this.selectedPlanets[index] = selectedPlanet;
    const hasPlanet = this.planets.some(
      (item: Planet) => item.name === selectedPlanet
    );

    this.planets = this.originalPlanets.filter(
      (item: Planet) => !this.selectedPlanets.includes(item.name)
    );

    this.adjustVehicleVisibility(index, hasPlanet);

    this.resetVehicles(index, selectedPlanet);
  }

  adjustVehicleVisibility(index: number, hasPlanet: boolean): void {
    const vehiclesBox: HTMLElement | null = document.querySelector(
      `#vehicles${index}`
    );

    if (!vehiclesBox) {
      return;
    }

    if (hasPlanet) {
      vehiclesBox.classList.remove('d-none');
    } else {
      vehiclesBox.classList.add('d-none');
    }
  }

  onVehicleChange(vehicle: Vehicle, index: number): void {
    vehicle.planet_name = this.selectedPlanets[index];
    this.resetVehicleCount(index);
    this.selectedVehicles[index] = vehicle;
    const vehicleIndex = this.vehicles.findIndex(
      (vehicle: Vehicle) => vehicle.name === this.selectedVehicles[index].name
    );
    this.vehicles[vehicleIndex].total_no -= 1;
    this.calculateTotalTimeTaken(index, 'add');
  }

  findFalcone(): void {
    this.falconeService
      .getToken()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (token: Token) => {
          this.falconeService.setSelectedLaunchItems({
            token: token.token,
            planet_names: [...this.selectedPlanets],
            vehicle_names: this.selectedVehicles.map((vehicle) => vehicle.name),
          });
          this.route.navigate(['/results'], {
            queryParams: { timeTaken: this.totalTimeTaken },
            queryParamsHandling: 'merge',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Token could not be retrieved';
          if (err.message) {
            this.errorMessage = err.message;
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(undefined);
    this.destroyed$.complete();
  }

  private apiErrorHandler(error: unknown): Observable<never> {
    this.errorMessage = error as string;
    return EMPTY;
  }

  private calculateTotalTimeTaken(id: number, action: string): void {
    const planet: Planet | undefined = this.originalPlanets.find(
      (planet: Planet) => planet.name === this.selectedVehicles[id].planet_name
    );
    if (!planet) {
      return;
    }
    const timeTakenByVehicle =
      planet.distance / this.selectedVehicles[id].speed;
    this.totalTimeTaken =
      action === 'add'
        ? this.totalTimeTaken + timeTakenByVehicle
        : this.totalTimeTaken - timeTakenByVehicle;
  }

  /**
   * This will reset the vehicle count to it's original state if
   * user selects another vehicle after selecting any other initially
   *
   * e.g. If user selects space pod first which has 2 count and reduced to 1 then user
   * selects space ship which has 1 count, then space pod reversed to 2 and space ship
   * selected and become 0
   *
   * @param id
   *
   */
  private resetVehicleCount(index: number): void {
    if (this.selectedVehicles[index]) {
      const vehicleIndex: number = this.vehicles.findIndex(
        (vehicle: Vehicle) => vehicle.name === this.selectedVehicles[index].name
      );
      this.vehicles[vehicleIndex].total_no += 1;
      this.calculateTotalTimeTaken(index, 'remove');
      this.selectedVehicles.splice(index, 1);
    }
  }

  private resetVehicles(index: number, planetName: string): void {
    const planet: Planet | undefined = this.originalPlanets.find(
      (planet: Planet) => planet.name === planetName
    );

    if (!planet) {
      return;
    }

    document
      .querySelectorAll(`input[name="vehicle${index}"]`)
      .forEach((vehicleInputElement: Element) => {
        const vehicleElement = vehicleInputElement as HTMLInputElement;
        vehicleElement.checked = false;
        vehicleElement.disabled = false;
        const vehicle = JSON.parse(vehicleElement.value);
        const isDistanceInRange = vehicle.max_distance < planet.distance;
        const isVehicleAvailable = vehicle.total_no === 0;

        if (isDistanceInRange || isVehicleAvailable) {
          vehicleElement.disabled = true;
        }
      });
    this.resetVehicleCount(index);
  }
}
