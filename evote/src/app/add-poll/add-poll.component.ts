import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-poll',
  templateUrl: './add-poll.component.html',
  styleUrls: ['./add-poll.component.css']
})
export class AddPollComponent implements OnInit {
  name: string = "nowe";
  start: string = "2020-01-10T00:00";
  end: string = "2020-01-11T00:00";
  candidates: string[] = ["zbyszek", "janek"];
  candidateNr: boolean[] = [true, true];
  finalVote: any = "false";
  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
  }

  addCandidate(){
    this.candidateNr.push(true);
  }

  addPoll() {
    console.log(this.start);
    const poll = {
      pollName: this.name,
      pollStart: this.parseDateString(this.start).getTime(),
      pollEnd: this.parseDateString(this.end).getTime(),
      candidates: this.candidates,
      isVoteFinal: this.finalVote
    };

    this.http.post('http://localhost:3000/polls/', poll).subscribe(() => {
      this.router.navigate(['glosowania']);
    });
  }

  private parseDateString(date:string): Date {
    date = date.replace('T', '-');
    var parts = date.split('-');
    var timeParts = parts[3].split(':');

    // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]),  parseInt(timeParts[0]),  parseInt(timeParts[1]));     // Note: months are 0-based

  }
}
