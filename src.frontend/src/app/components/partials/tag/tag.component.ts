import { Component, Input, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent implements OnInit {

  @Input() value:string = "";
  constructor() { }

  ngOnInit(): void {
  }



  getColor():string{
    return HelperService.toHue(this.value);
   }

   getForegroundColor():string {
    return HelperService.foregroundFromHue(this.getColor());
   }
 

}
