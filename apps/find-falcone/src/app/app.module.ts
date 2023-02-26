import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FalconFinderModule } from './falcone-finder/falcone-finder.module';
import { FooterModule } from './footer/footer.module';
import { HeaderInterceptor } from './header.interceptor';
import { HeaderModule } from './header/header.module';
import { ResultsModule } from './results/results.module';
import { WelcomeModule } from './welcome/welcome.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    WelcomeModule,
    HeaderModule,
    FooterModule,
    FalconFinderModule,
    ResultsModule,
    RouterModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
