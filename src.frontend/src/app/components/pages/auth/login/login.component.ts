import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginDataModel } from 'src/app/models/login-data.model';
import { BackendService } from 'src/app/services/backend.service';
import * as CryptoJS from 'crypto-js';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginData:LoginDataModel = {username:'', password: ''};
  validState:boolean = true;

  constructor(private backend: BackendService, private router:Router, private messageService: MessageService) { }

  ngOnInit(): void {
  }

  login() {
    this.validState = true;
    this.backend.login(this.loginData).subscribe( (data) => {

      if(data.state && data.token){
        localStorage.setItem('token', data.token); 

        let key = CryptoJS.SHA256(this.loginData.username.toLowerCase() + this.loginData.password).toString();
        localStorage.setItem('username', this.loginData.username.toLowerCase()); 
        localStorage.setItem('masterkey', key); 
        this.messageService.add({detail: 'Login successfull', severity: 'success'});

        this.router.navigateByUrl('/');
      } else {
        this.validState = false;
        this.loginData.password = "";
        this.messageService.add({detail: 'Login failed', severity: 'error'});
      }

    });
  }

}
