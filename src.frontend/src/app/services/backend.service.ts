import { Injectable, Type } from '@angular/core';
import {CredentialModel} from '../models/credential.model'
import { HttpClient } from '@angular/common/http';
import { ConnectionModel } from '../models/connection.model';
import { LoginDataModel } from '../models/login-data.model';
import { catchError, map } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  errorHandling(error:any, caught?:any) {
    return caught;
  }





  getCredentials(){
    return this.http.get<CredentialModel[]>('http://localhost:5000/api/credentials').pipe(map((a:any) => a.data));
  }

  getCredential(id:number){
    let key = <string>localStorage.getItem('masterkey'); 
    
    return this.http.get<CredentialModel>('http://localhost:5000/api/credentials/' + id).pipe(
      map((a:any) => a.data),
      map( (cred:CredentialModel) => {
        cred.password = CryptoJS.AES.decrypt(<string>cred.password, key).toString(CryptoJS.enc.Utf8);
        cred.privateKey =  CryptoJS.AES.decrypt(<string>cred.privateKey, key).toString(CryptoJS.enc.Utf8);
        return cred;
      } )
    );
  }

  putCredential(cred:CredentialModel){
    let key = <string>localStorage.getItem('masterkey'); 
    cred.password = cred.password ? CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(<string>cred.password), key).toString() : '';
    cred.privateKey = cred.privateKey ? CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(<string>cred.privateKey), key).toString() : '';

    return this.http.put<CredentialModel>('http://localhost:5000/api/credentials/', cred).subscribe();
  }

  postCredential(cred:CredentialModel){
    let key = <string>localStorage.getItem('masterkey'); 
    cred.password = cred.password ? CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(<string>cred.password), key).toString() : '';
    cred.privateKey = cred.privateKey ? CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(<string>cred.privateKey), key).toString() : '';

    return this.http.post<CredentialModel>('http://localhost:5000/api/credentials/' + cred.id, cred).subscribe();
  }

  patchCredential(updateData:any[]){
    return this.http.patch<any>('http://localhost:5000/api/credentials', updateData);
  }

  deleteCredential(cred:CredentialModel){
    this.http.delete<any>('http://localhost:5000/api/credentials/' + cred.id).subscribe();
  }



  getTags(){
    return this.http.get<string[]>('http://localhost:5000/api/tags').pipe(map((a:any) => a.data));
  }



  getConnections(){
    return this.http.get<ConnectionModel[]>('http://localhost:5000/api/connections').pipe(map((a:any) => a.data));
  }

  getConnection(id:number){
    let key = <string>localStorage.getItem('masterkey'); 
    return this.http.get<ConnectionModel>('http://localhost:5000/api/connections/' + id).pipe(
      map((a:any) => a.data),
      map( (con:ConnectionModel) => {
        if(con.credential){
          con.credential.password = CryptoJS.AES.decrypt(<string>con.credential.password, key).toString(CryptoJS.enc.Utf8);
          con.credential.privateKey = CryptoJS.AES.decrypt(<string>con.credential.privateKey, key).toString(CryptoJS.enc.Utf8);
        }
        return con;
      } )
    );
  }

  putConnection(con:ConnectionModel){
    return this.http.put<ConnectionModel>('http://localhost:5000/api/connections/', con).pipe(map((a:any) => a.data));
  }

  postConnection(con:ConnectionModel){
    return this.http.post<ConnectionModel>('http://localhost:5000/api/connections/' + con.id, con).pipe(map((a:any) => a.data));
  }

  deleteConnection(con:ConnectionModel){
    this.http.delete<any>('http://localhost:5000/api/connections/' + con.id).subscribe();
  }


  postUser(loginData:LoginDataModel){
    return this.http.post<LoginDataModel>('http://localhost:5000/api/user', loginData).pipe(map((a:any) => a.data));
  }

  getUser(){  
    return this.http.get<UserModel>('http://localhost:5000/api/user').pipe(
      map((a:any) => a.data),
    );
  }



  getRdpFile(id:number){
    return this.http.get<any>('http://localhost:5000/api/connections/' + id + '/rdp');
  }


  login(loginData:LoginDataModel) {
    return this.http.post<{state:boolean,token?:string}>('http://localhost:5000/api/token/sign',loginData);
  }

}
