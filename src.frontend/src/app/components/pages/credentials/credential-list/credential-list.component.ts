import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CredentialModel } from 'src/app/models/credential.model';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-credential-list',
  templateUrl: './credential-list.component.html',
  styleUrls: ['./credential-list.component.scss']
})
export class CredentialListComponent implements OnInit {

  public credentials:CredentialModel[] = [];

  constructor(private backend:BackendService) {

    this.backend.getCredentials().subscribe((a:any) => {this.credentials = a});
  }

  ngOnInit(): void {
  }

}
