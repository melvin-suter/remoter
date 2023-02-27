import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { CredentialModel } from 'src/app/models/credential.model';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-credential-view',
  templateUrl: './credential-view.component.html',
  styleUrls: ['./credential-view.component.scss'],
})
export class CredentialViewComponent implements OnInit {

  credential:CredentialModel = {name:'b'};
  id:any = "new";
  title:string = "New";

  constructor(private route:ActivatedRoute, private backend:BackendService, private router:Router, private ref:ChangeDetectorRef, private confirmationService: ConfirmationService) {
    this.route.params.subscribe( (params) => {
      this.id == params["id"];

      if(params['id'] == "new"){
        this.credential = {name:''};
      } else {
        backend.getCredential(params["id"]).subscribe((cred) => {
          this.credential = cred;
          this.id = cred.id;
          this.title = cred.name;
        });
      }
    });
  }

  ngOnInit(): void {
    
  }

  save(){
    if(this.id == "new"){
      this.backend.putCredential(this.credential);
    } else {
      this.backend.postCredential(this.credential);
    }
    this.router.navigate(['/credentials']);
  }

  deleteConfirm() {
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete "'+this.credential.name+'"?',
        header: "Delete",
        accept: () => {
            this.backend.deleteCredential(this.credential);
            this.router.navigate(['/credentials']);
          }
    });
  }

}
