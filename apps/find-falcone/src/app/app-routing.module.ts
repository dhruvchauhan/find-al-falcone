import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FalconeFinderComponent } from './falcone-finder/falcone-finder.component';
import { ResultsComponent } from './results/results.component';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: WelcomeComponent },
  { path: 'find-falcone', component: FalconeFinderComponent },
  { path: 'results', component: ResultsComponent },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
