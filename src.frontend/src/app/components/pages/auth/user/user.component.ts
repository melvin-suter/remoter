import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CredentialModel } from 'src/app/models/credential.model';
import { LoginDataModel } from 'src/app/models/login-data.model';
import { UserModel } from 'src/app/models/user.model';
import { BackendService } from 'src/app/services/backend.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  loginData:UserModel = {username: '', password: ''};

  constructor(private backend:BackendService, private router:Router, private messageService: MessageService) { 
    this.backend.getUser().subscribe((data:UserModel) => {
      this.loginData = data;
    });
    this.loginData.username = <string>localStorage.getItem('username');
  }

  ngOnInit(): void {
  }

  save(){
    this.backend.postUser(this.loginData).subscribe(() => {
      this.messageService.add({ detail: 'Saves successfully', severity: 'success' });

      if(this.loginData.password.length > 0){
        this.messageService.add({ detail: 'Starting reencrypt, please dont reload this page', severity: 'info' });

        let oldKey = <string>localStorage.getItem('masterkey'); 
        let newKey = CryptoJS.SHA256(this.loginData.username.toLowerCase() + this.loginData.password).toString();

        this.backend.getCredentials().subscribe( (credentials:CredentialModel[]) => {
          let updateData:any[] = [];

          credentials.forEach( (credential:CredentialModel) => {
            let dat = {
              id: credential.id,
              password: '',
              privateKey: ''
            };


            dat.password = credential.password ? CryptoJS.AES.encrypt(
              CryptoJS.enc.Utf8.parse(
                CryptoJS.AES.decrypt(<string>credential.password, oldKey).toString(CryptoJS.enc.Utf8)
                )
              , newKey).toString() : '';

            dat.privateKey = credential.privateKey ? CryptoJS.AES.encrypt(
              CryptoJS.enc.Utf8.parse(
                CryptoJS.AES.decrypt(<string>credential.password, oldKey).toString(CryptoJS.enc.Utf8)
              )
              , newKey).toString() : '';

            updateData.push(dat);
          });

          this.backend.patchCredential(updateData).subscribe( () => {
            localStorage.setItem('masterkey', newKey);
            this.messageService.add({ detail: 'Reencryption successfull', severity: 'success' });
            this.router.navigate(['/']);
          });
        });
      } else {
        this.router.navigate(['/']);

      }

    });
  }

}
