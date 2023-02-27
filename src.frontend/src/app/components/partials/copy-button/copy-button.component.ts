import { Component, Input, OnInit } from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-copy-button',
  templateUrl: './copy-button.component.html',
  styleUrls: ['./copy-button.component.scss']
})
export class CopyButtonComponent implements OnInit {

  @Input() value:string = "";
  @Input() descriptor:string = "";

  constructor(private clipboard: Clipboard, private messageService: MessageService) { }

  ngOnInit(): void {
  }

  copy(){
    this.clipboard.copy(this.value);
    this.messageService.add({detail: this.descriptor.length > 0 ? this.descriptor + ' copied to clipboard' : 'Copied to clipboard', severity: 'success'});
  }

}
