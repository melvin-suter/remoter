import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  display:boolean = false;
  items: MenuItem[];
  itemsBottom: MenuItem[];
  
  constructor() {
    this.items = [
        {label: 'Home', icon: 'pi pi-fw pi-home', url: "/"},
        {label: 'Connection', icon: 'pi pi-fw pi-desktop', url:"/connections"},
        {label: 'Credentials', icon: 'pi pi-fw pi-unlock', url:"/credentials"},
    ];
    this.itemsBottom = [
      { label: 'User Profile',icon: 'pi pi-fw pi-user', url:'/auth/user'},
      {label: 'Logout', icon: 'pi pi-fw pi-sign-out', url: '/auth/logout'},

    ];
   }

  

  ngOnInit() {
  }

}
