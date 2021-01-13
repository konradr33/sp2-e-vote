import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';


@Component({
  selector: 'app-glosowania',
  templateUrl: './glosowania.component.html',
  styleUrls: ['./glosowania.component.css']
})
export class GlosowaniaComponent implements OnInit {

  polls: Poll[] = [];

  constructor(private http: HttpClient, private router:Router) { }

  ngOnInit(): void {
    this.getPolls().subscribe((polls: any) => {
     this.polls = polls;
    });

  }

  // tslint:disable-next-line:typedef
  getPolls(){
    return this.http.get('http://localhost:3000/polls');
  }




  // tslint:disable-next-line:typedef
  voteForm(ID: string) {
    this.router.navigate(['glosuj', ID]);
  }

  // tslint:disable-next-line:typedef
  results(ID: string) {
    this.router.navigate(["wyniki", ID]);
  }

  // tslint:disable-next-line:typedef
  during(start: Date, end: Date) {
    const now = new Date();
    if (start < now && now < end){
      return true;
    }else{
      return false;
    }

  }

  // tslint:disable-next-line:typedef
  after(end: Date) {
    const now = new Date();
    if (end < now ){
      return true;
    }else{
      return false;
    }
  }
}

export interface Poll {
  ID: string;
  type: string;
  name: string;
  start: Date;
  end: Date;
  candidates: string[];
  isVoteFinal: boolean;
}

