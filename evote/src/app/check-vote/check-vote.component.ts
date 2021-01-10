import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-check-vote',
  templateUrl: './check-vote.component.html',
  styleUrls: ['./check-vote.component.css']
})
export class CheckVoteComponent implements OnInit {

  id = '';
  vote : any;
  poll : any;

  constructor(private http: HttpClient, private ar: ActivatedRoute) { }


  ngOnInit(): void {
    this.id = this.ar.snapshot.params.id;

    this.getVote().subscribe((x: any) => {
      this.vote = JSON.parse(x) ;
      this.getPoll(this.vote.pollId).subscribe((xx:any) => {
        this.poll = JSON.parse(xx);
      });
    })

  }

  getVote(){
    return this.http.get('http://localhost:3000/votes/' + this.id);
  }

  getPoll(id){
    return this.http.get('http://localhost:3000/polls/' + id)
  }


  votedTo() {
    return this.poll.candidates[parseInt(this.vote.optionIndex)];
  }
}
