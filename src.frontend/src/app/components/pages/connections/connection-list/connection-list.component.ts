import { Component, OnInit } from '@angular/core';
import { debounceTime, filter, Subject } from 'rxjs';
import { ConnectionModel } from 'src/app/models/connection.model';
import { BackendService } from 'src/app/services/backend.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-connection-list',
  templateUrl: './connection-list.component.html',
  styleUrls: ['./connection-list.component.scss']
})
export class ConnectionListComponent implements OnInit {

  connections:ConnectionModel[] = [];
  connectionsFiltered:ConnectionModel[] = [];
  private searchModelChange: Subject<string> = new Subject<string>();

  selectedTags:any =[];
  tags:string[] = [];
  searchText:string = "";

  constructor(private backend:BackendService) {

    this.backend.getConnections().subscribe((a:any) => {
     this.connections = a;
     this.runFilter();
    });

    this.searchModelChange
      .pipe(
        debounceTime(1000),
      )
      .subscribe(() => {
        this.runFilter();
      });
  }


  runFilter() {
    this.connectionsFiltered = [];

    if(this.selectedTags.length == 0 && this.searchText.length == 0){
      this.connectionsFiltered = this.connections;
      return;
    }

    this.connections.forEach( (con) =>{

      // Tag Filtering
      let filterHit = this.selectedTags.length <= 0;

      this.selectedTags.forEach( (tag:string) => {
        // Normal Search
        if(con.tags?.split(',').includes(tag)){ 
          filterHit = true;
        }

        // Advanced Search
        if(
          (tag.startsWith("/") && tag.endsWith("/") && tag.length >= 3) // Regex
          || (tag.includes(".*"))
        ){
          // Remove / from start/end if present
          let query = tag.startsWith("/") && tag.endsWith("/") && tag.length >= 3 ? tag.substring(1, tag.length -1) : tag;
          let regex = new RegExp(query);
          let regexLower = new RegExp(query.toLowerCase());

          con.tags?.split(',').forEach( (conTag:string) => {
            if(regex.test(conTag) || regexLower.test(conTag.toLowerCase())){
              filterHit = true;
            }
          });
        }
      });

      if(!filterHit){return};
      filterHit = false;

      // FullText Sarch
      if(con.hostname.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      if(con.name.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      if(con.description?.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      if(con.tags?.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      
      if(filterHit){
        this.connectionsFiltered.push(con);
      }

    });
  }


  inputChanged() {
    this.searchModelChange.next("");
  }



  search(searchEvent:any) {
    let newTagArr:string[] = [];

    let tagList = this.backend.getConnectionTags().subscribe( (tags:string[]) => {
      tags.forEach( (item) => {
        if(item != null && item != undefined){
          item.split(",").forEach((tag) => {
            if(!newTagArr.includes(tag) && tag.toLowerCase().includes(searchEvent.query.toLowerCase())){
              newTagArr.push(tag);
            }
          });
        }
      });

      
      if(
        ((<string>searchEvent.query).startsWith("/") && (<string>searchEvent.query).endsWith("/")) // Is a regex query
        || ((<string>searchEvent.query).includes(".*")) // Wildcard
      ){
        newTagArr.push(searchEvent.query);
      }

      this.tags = newTagArr;
    });
  }


  ngOnInit(): void {
  }

}
