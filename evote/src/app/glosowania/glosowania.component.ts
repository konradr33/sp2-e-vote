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
    this.getPolls().subscribe((polls:any) => {
     this.polls = JSON.parse(polls);
     console.log(this.polls);
    });

  }

  // tslint:disable-next-line:typedef
  getPolls(){
    return this.http.get('http://localhost:3000/polls');
  }




  voteForm(ID: string) {
    this.router.navigate(['glosuj', ID]);
  }

  results(ID: string) {

  }
}

export interface PoolRecord {
  ID: string;
  type: string;
  name: string;
  start: Date;
  end: Date;
  candidates: string[];
  isVoteFinal: boolean;
}

export interface Poll {
  Key: string;
  Record: PoolRecord;
}
