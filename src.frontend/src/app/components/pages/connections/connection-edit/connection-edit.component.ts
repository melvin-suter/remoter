import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConnectionType } from 'src/app/models/connection-type.enum';
import { ConnectionModel } from 'src/app/models/connection.model';
import { CredentialModel } from 'src/app/models/credential.model';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-connection-edit',
  templateUrl: './connection-edit.component.html',
  styleUrls: ['./connection-edit.component.scss']
})
export class ConnectionEditComponent implements OnInit {

  credentials:CredentialModel[] = [];
  connection:ConnectionModel = {name:'', hostname: '', type: ConnectionType.rdp};
  connectionTypes:any[] =[
    {"type": ConnectionType.rdp, "name": "RDP"},
    {"type": ConnectionType.ssh, "name": "SSH"}
  ] ;

  id:any = "new";
  title:string = "New";

  selectedTags:any =[];
  tags:string[] = [];

  constructor(private route:ActivatedRoute, private backend:BackendService, private router:Router, private ref:ChangeDetectorRef, private confirmationService: ConfirmationService) {
    this.backend.getCredentials().subscribe( (a) => {
      this.credentials = a;
      this.credentials.unshift({name: 'None'});
    });

    this.route.params.subscribe( (params) => {
      this.id == params["id"];

      if(params['id'] == "new"){
        this.connection = {name:'',hostname: '', type: ConnectionType.rdp};
      } else {
        backend.getConnection(params["id"]).subscribe((con) => {
          this.connection = con;
          this.selectedTags = this.connection.tags?.split(',');
          this.id = con.id;
          this.title = con.name;
        });
      }
    });
  }

  search(searchEvent:any) {
    let newTagArr:string[] = [];

    let tagList = this.backend.getTags().subscribe( (tags:string[]) => {
      tags.forEach( (item) => {
        if(item != null && item != undefined){
          item.split(",").forEach((tag) => {
            if(!newTagArr.includes(tag) && tag.toLowerCase().includes(searchEvent.query.toLowerCase())){
              newTagArr.push(tag);
            }
          });
        }
      });
      newTagArr.push(searchEvent.query);

      this.tags = newTagArr;
    });
  }

  ngOnInit(): void {
    
  }

  save(){
    this.connection.credential = undefined;
    this.connection.tags = this.selectedTags.join(",");
    if(this.id == "new"){
      this.backend.putConnection(this.connection).subscribe( (con:ConnectionModel) => {this.router.navigate(['/connections', con.id])});
    } else {
      this.backend.postConnection(this.connection).subscribe( (con:ConnectionModel) => {this.router.navigate(['/connections', con.id])});
    }
  }

  deleteConfirm() {
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete "'+this.connection.name+'"?',
        header: "Delete",
        accept: () => {
            this.backend.deleteConnection(this.connection);
            this.router.navigate(['/connections']);
          }
    });
  }

}
