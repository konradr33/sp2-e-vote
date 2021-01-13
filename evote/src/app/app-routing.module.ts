import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WynikiComponent} from './wyniki/wyniki.component';
import {GlosowaniaComponent} from './glosowania/glosowania.component';
import {GlosujComponent} from './glosuj/glosuj.component';
import {CheckVoteComponent} from './check-vote/check-vote.component';
import {AddPollComponent} from './add-poll/add-poll.component';

const routes: Routes = [
  {path: 'wyniki/:id', component: WynikiComponent},
  {path: 'glosowania', component: GlosowaniaComponent},
  {path: 'glosuj/:id', component: GlosujComponent},
  {path: 'checkVote/:id', component: CheckVoteComponent},
  {path: 'addPoll', component: AddPollComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
