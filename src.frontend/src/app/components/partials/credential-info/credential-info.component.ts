import { Component, Input, OnInit } from '@angular/core';
import { CredentialModel } from 'src/app/models/credential.model';

@Component({
  selector: 'app-credential-info',
  templateUrl: './credential-info.component.html',
  styleUrls: ['./credential-info.component.scss']
})
export class CredentialInfoComponent implements OnInit {

  @Input()credential?:CredentialModel = {name:'', username: '', password: '', privateKey: ''};

  constructor() { }

  ngOnInit(): void {
  }

}
