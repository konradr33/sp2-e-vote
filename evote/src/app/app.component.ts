import { Component } from '@angular/core';
import { AppRoutingModule} from './app-routing.module';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'evote';

  constructor(private router: Router) {

  }


  check() {
    let id = prompt("Podaj ID głosu", '');
    this.router.navigate(['checkVote', id]);
  }
}
