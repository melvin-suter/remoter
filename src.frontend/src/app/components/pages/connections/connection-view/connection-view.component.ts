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
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-connection-view',
  templateUrl: './connection-view.component.html',
  styleUrls: ['./connection-view.component.scss']
})
export class ConnectionViewComponent implements OnInit {

  connection:ConnectionModel = {name:'', hostname: '', type: ConnectionType.rdp};
  ConnectionType = ConnectionType;

  commandSSHLinux = {view:"",copy:""};
  commandSSHWindows = {view:"",copy:""};
  commandGuacamole = {view:"",copy:""};

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


          this.commandGuacamole.view = ConnectionType[this.connection.type] + "://";
          this.commandGuacamole.view += this.connection.credential?.username && this.connection.credential?.username.length > 0 ? encodeURI(this.connection.credential.username) : '';
          this.commandGuacamole.view += this.connection.credential?.password && this.connection.credential?.password.length > 0 ? ":" + "*".repeat(this.connection.credential.password.length) : '';
          this.commandGuacamole.view += (this.connection.credential?.password && this.connection.credential?.password.length > 0) || (this.connection.credential?.username && this.connection.credential?.username.length > 0 ) ? "@" : '';
          this.commandGuacamole.view += this.connection.hostname;
          this.commandGuacamole.view += this.connection.port && this.connection.port.length > 0 ? ":" + this.connection.port : '';
          
          this.commandGuacamole.copy = ConnectionType[this.connection.type] + "://";
          this.commandGuacamole.copy += this.connection.credential?.username && this.connection.credential?.username.length > 0 ? encodeURI(this.connection.credential.username) : '';
          this.commandGuacamole.copy += this.connection.credential?.password && this.connection.credential?.password.length > 0 ? ":" + encodeURI(this.connection.credential.password) : '';
          this.commandGuacamole.copy += (this.connection.credential?.password && this.connection.credential?.password.length > 0) || (this.connection.credential?.username && this.connection.credential?.username.length > 0 ) ? "@" : '';
          this.commandGuacamole.copy += this.connection.hostname;
          this.commandGuacamole.copy += this.connection.port && this.connection.port.length > 0 ? ":" + this.connection.port : '';
          
          if(this.connection.type == ConnectionType.rdp) {
            this.commandGuacamole.view += "/?security=any&ignore-cert=true";
            this.commandGuacamole.copy += "/?security=any&ignore-cert=true";
          }


          if(this.connection.credential?.password && this.connection.credential.password.length > 0){
            this.commandSSHLinux.copy = "sshpass -p\"$(echo '" + btoa(this.connection.credential.password) + "' | base64 -d)\" ";
          }

          this.commandSSHLinux.copy += "ssh "
          this.commandSSHWindows.copy += "ssh "

          if(this.connection.credential?.username && this.connection.credential.username.length > 0){
            this.commandSSHLinux.copy += "-l" + this.connection.credential.username + " ";
            this.commandSSHWindows.copy += "-l" + this.connection.credential.username + " ";
          }

          if(this.connection.credential?.privateKey && this.connection.credential.privateKey.length > 0){
            this.commandSSHLinux.copy += "-i '~/.ssh/"+this.connection.credential.name+"' "
            this.commandSSHWindows.copy += "-i '~/.ssh/"+this.connection.credential.name+"' "
          }

          if(this.connection.port && this.connection.port.length > 0){
            this.commandSSHLinux.copy += "-p" + this.connection.port + " ";
            this.commandSSHWindows.copy += "-p" + this.connection.port + " ";
          }

          this.commandSSHLinux.copy += this.connection.hostname + " ; history -d $(history 1)";
          this.commandSSHWindows.copy += this.connection.hostname + "";

          this.commandSSHLinux.view = this.commandSSHLinux.copy;
          this.commandSSHWindows.view = this.commandSSHWindows.copy;

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
