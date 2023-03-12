import { Component, OnInit } from '@angular/core';
import { ConnectionModel } from 'src/app/models/connection.model';
import { CredentialModel } from 'src/app/models/credential.model';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  connections:ConnectionModel[] = [];
  credentials:CredentialModel[] = [];
  topConnectionTags:string[] = []
  topCredentialTags:string[] = []
  totalTags:number = 0;

  constructor(private backend:BackendService) { 

    this.backend.getConnections().subscribe( (cons:any[]) => {
      let tags:{ [id: string] : number; } = {};
      this.connections = cons;

      this.connections.forEach((con:ConnectionModel) => {
        if(con.tags && con.tags.length > 0){
          con.tags.split(",").forEach((tag:string) => {

            if(Object.keys(tags).includes(tag)){
              tags[tag] += 1;
            }

            if(tags[tag]){
              tags[tag]++;
            } else {
              tags[tag] = 1;
            }

          });
        }
      });

      this.topConnectionTags = Object.keys(tags).map((k) => {
        return [k, tags[k]];
      }).sort( (first:any, second:any) => {
        return second[1] - first[1];
      }).slice(0,5).map((item:any) => item[0]);

      this.totalTags += Object.keys(tags).length;
    });

    this.backend.getCredentials().subscribe( (cred:any[]) => {
      let tags:{ [id: string] : number; } = {};
      this.credentials = cred;

      this.credentials.forEach((con:CredentialModel) => {
        if(con.tags && con.tags.length > 0){
          con.tags.split(",").forEach((tag:string) => {

            if(Object.keys(tags).includes(tag)){
              tags[tag] += 1;
            }

            if(tags[tag]){
              tags[tag]++;
            } else {
              tags[tag] = 1;
            }

          });
        }
      });

      this.topCredentialTags = Object.keys(tags).map((k) => {
        return [k, tags[k]];
      }).sort( (first:any, second:any) => {
        return second[1] - first[1];
      }).slice(0,5).map((item:any) => item[0]);

      this.totalTags += Object.keys(tags).length;
    });
  }

  ngOnInit(): void {
  }

}
