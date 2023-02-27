import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConnectionType } from 'src/app/models/connection-type.enum';
import { ConnectionModel } from 'src/app/models/connection.model';
import { CredentialModel } from 'src/app/models/credential.model';
import { BackendService } from 'src/app/services/backend.service';
import * as FileSaver from 'file-saver';
import { Clipboard } from '@angular/cdk/clipboard';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-connection-view',
  templateUrl: './connection-view.component.html',
  styleUrls: ['./connection-view.component.scss']
})
export class ConnectionViewComponent implements OnInit {

  connection:ConnectionModel = {name:'', hostname: '', type: ConnectionType.rdp};
  ConnectionType = ConnectionType;
  downloadAPI = "http://localhost:5000/";
  sshDownloadTextLinux = "";
  sshDownloadTextWindows = "";

  constructor(
    private http:HttpClient, private route:ActivatedRoute, 
    private backend:BackendService, private router:Router,  private confirmationService: ConfirmationService,
    private messageService:MessageService,
    private clipboard:Clipboard
  ) {
    
    this.route.params.subscribe( (params) => {
      if(params['id'] == "new"){
        this.connection = {name:'',hostname: '', type: ConnectionType.rdp};
      } else {
        backend.getConnection(params["id"]).subscribe((cred) => {
          this.connection = cred;
          this.downloadAPI = "http://localhost:5000/api/connections/" + this.connection.id + "/" + ConnectionType[this.connection.type].toLowerCase();



          if(this.connection.credential?.password && this.connection.credential.password.length > 0){
            this.sshDownloadTextLinux = "sshpass -p'" + this.connection.credential.password + "' ";
          }

          this.sshDownloadTextLinux += "ssh "
          this.sshDownloadTextWindows += "ssh "

          if(this.connection.credential?.username && this.connection.credential.username.length > 0){
            this.sshDownloadTextLinux += "-l" + this.connection.credential.username + " ";
            this.sshDownloadTextWindows += "-l" + this.connection.credential.username + " ";
          }

          if(this.connection.credential?.privateKey && this.connection.credential.privateKey.length > 0){
            this.sshDownloadTextLinux += "-i '~/.ssh/"+this.connection.credential.name+"' "
            this.sshDownloadTextWindows += "-i '~/.ssh/"+this.connection.credential.name+"' "
          }

          if(this.connection.port && this.connection.port.length > 0){
            this.sshDownloadTextLinux += "-p" + this.connection.port + " ";
            this.sshDownloadTextWindows += "-p" + this.connection.port + " ";
          }

          this.sshDownloadTextLinux += this.connection.hostname + " ; history -d $(history 1)";
          this.sshDownloadTextWindows += this.connection.hostname + "";


        });
      }
    });
  }

  ngOnInit(): void {
  }


  downloadSSHKey(){
    if(this.connection.credential?.privateKey){
      // start download
      let blob = new Blob([this.connection.credential?.privateKey], { type: 'application/octet-stream'   });


      FileSaver.saveAs(blob, this.connection.credential.name);

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

  copy() {
    let cloned = JSON.parse(JSON.stringify(this.connection));
    cloned.id = undefined;
    cloned.name += ' - Copy';
    this.backend.putConnection(cloned).subscribe((con:ConnectionModel) =>{
      this.router.navigateByUrl('/connections/' + con.id + '/edit');
    });
  }
  

  downloadWindowsRDPFile(){
    this.http.get('/assets/templates/ms-win.rdp.txt', {headers:{'skip-backend': "", 'Accept': 'text/plain'}, responseType: 'text'}).subscribe((data:any) => {

      // prepare content
      data += "\nfull address:s:" + this.connection.hostname;
      if(this.connection.credential?.username){
        data += "\nusername:s:" + this.connection.credential.username;
      }
      if(this.connection.credential?.domain){
        data += "\ndomain:s:" + this.connection.credential.domain;
      }

      // start download
      let blob = new Blob([data], { type: 'application/octet-stream'   });
      let url = window.URL.createObjectURL(blob);
      let anchor = document.createElement("a");
      anchor.download = this.connection.name + ".rdp";
      anchor.href = url;
      anchor.click();

      // Add PW to clip
      if(this.connection.credential?.password){
        this.clipboard.copy(this.connection.credential?.password);
        this.messageService.add({detail: 'Password copied to clipboard', severity: 'success'});
      }
   
    });
  }

}
