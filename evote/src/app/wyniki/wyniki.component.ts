import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-wyniki',
  templateUrl: './wyniki.component.html',
  styleUrls: ['./wyniki.component.css']
})
export class WynikiComponent implements OnInit {

  constructor(private http: HttpClient, private ar: ActivatedRoute) { }

  votes: any ;

  ngOnInit(): void {
    this.getVotes().subscribe((x:any)=>{
      this.votes = JSON.parse(x);
      console.log(this.votes);
    })
  }

  getVotes(){
    return this.http.get('http://localhost:3000/votes');
  }



  str(it){
    return JSON.stringify(it);
  }
}
