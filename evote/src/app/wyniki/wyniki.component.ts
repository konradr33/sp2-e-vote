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

  results: {} ;


  ngOnInit(): void {
    const id = this.ar.snapshot.params.id;
    this.getResults(id).subscribe((x: any) => {
      const res = JSON.parse(x);
      const status = res.status;
      if ( status === "ok"){
        this.results = res.results;
      }else{
        alert(status);
      }

      console.log(this.results);
    });
  }

  // tslint:disable-next-line:typedef
  getResults(id){
    return this.http.get('http://localhost:3000/results/' + id);
  }



  str(it){
    return JSON.stringify(it);
  }
}
