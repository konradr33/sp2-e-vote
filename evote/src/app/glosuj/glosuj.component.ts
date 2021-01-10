import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {PoolRecord} from '../glosowania/glosowania.component';

@Component({
  selector: 'app-glosuj',
  templateUrl: './glosuj.component.html',
  styleUrls: ['./glosuj.component.css']
})
export class GlosujComponent implements OnInit {

  constructor(private http: HttpClient, private ar: ActivatedRoute) { }
  poll: PoolRecord;
  id = '';

  ngOnInit(): void {
    this.id = this.ar.snapshot.params.id;

    this.getPoll().subscribe((poll: any) => {
      this.poll = JSON.parse(poll);
      console.log(poll);
    });

  }

  // tslint:disable-next-line:typedef
  getPoll(){
    return this.http.get('http://localhost:3000/polls/' + this.id);
  }


  vote(i: number) {

    const vote = {
      pollId: this.poll.ID,
      optionIndex: i,
      publicKey: '',
      signature: ''
    };

    this.http.post(
     ' http://localhost:3000/votes/',
      vote
    ).subscribe(
      (x: any) => {
        alert(JSON.parse(x).ID);
      }
    );
  }
}
