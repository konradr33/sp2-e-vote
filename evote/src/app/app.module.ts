import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WynikiComponent } from './wyniki/wyniki.component';
import { GlosowaniaComponent } from './glosowania/glosowania.component';
import { GlosujComponent } from './glosuj/glosuj.component';
import {HttpClientModule} from '@angular/common/http';
import { CheckVoteComponent } from './check-vote/check-vote.component';
import { AddPollComponent } from './add-poll/add-poll.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    WynikiComponent,
    GlosowaniaComponent,
    GlosujComponent,
    CheckVoteComponent,
    AddPollComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
