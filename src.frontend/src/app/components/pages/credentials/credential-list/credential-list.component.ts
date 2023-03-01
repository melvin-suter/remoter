import { Component, OnInit } from '@angular/core';
import { debounceTime, Observable, Subject } from 'rxjs';
import { CredentialModel } from 'src/app/models/credential.model';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-credential-list',
  templateUrl: './credential-list.component.html',
  styleUrls: ['./credential-list.component.scss']
})
export class CredentialListComponent implements OnInit {
  credentialsFiltered:CredentialModel[] = [];
  private searchModelChange: Subject<string> = new Subject<string>();

  selectedTags:any =[];
  tags:string[] = [];
  searchText:string = "";

  public credentials:CredentialModel[] = [];

  constructor(private backend:BackendService) {

    this.backend.getCredentials().subscribe((a:any) => {
      this.credentials = a;
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

  ngOnInit(): void {
  }


  runFilter() {
    this.credentialsFiltered = [];

    if(this.selectedTags.length == 0 && this.searchText.length == 0){
      this.credentialsFiltered = this.credentials;
      return;
    }

    this.credentials.forEach( (con) =>{

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
      if(con.username?.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      if(con.domain?.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      if(con.name.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      if(con.description?.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      if(con.tags?.toLowerCase().includes(this.searchText.toLowerCase())){filterHit = true;}
      
      if(filterHit){
        this.credentialsFiltered.push(con);
      }

    });
  }


  inputChanged() {
    this.searchModelChange.next("");
  }



  search(searchEvent:any) {
    let newTagArr:string[] = [];

    let tagList = this.backend.getCredentialTags().subscribe( (tags:string[]) => {
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


}
