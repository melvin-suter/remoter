import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogoutComponent } from './components/pages/auth/logout/logout.component';
import { AppLayoutComponent } from './components/layout/app-layout/app-layout.component';
import { AuthLayoutComponent } from './components/layout/auth-layout/auth-layout.component';
import { LoginComponent } from './components/pages/auth/login/login.component';
import { ConnectionEditComponent } from './components/pages/connections/connection-edit/connection-edit.component';
import { ConnectionListComponent } from './components/pages/connections/connection-list/connection-list.component';
import { ConnectionViewComponent } from './components/pages/connections/connection-view/connection-view.component';
import { CredentialListComponent } from './components/pages/credentials/credential-list/credential-list.component';
import { CredentialViewComponent } from './components/pages/credentials/credential-view/credential-view.component';
import { HomeComponent } from './components/pages/home/home.component';
import { UserComponent } from './components/pages/auth/user/user.component';

const routes: Routes = [
  { path: 'auth', component: AuthLayoutComponent, children: [
    {path: 'login', component: LoginComponent},
    {path: 'logout', component: LogoutComponent},
  ]},
  { path: '', component: AppLayoutComponent,children:[
    {path: '', component:HomeComponent},
    {path: 'auth/user', component: UserComponent},
    {path: 'credentials/:id', component: CredentialViewComponent},
    {path: 'credentials', component: CredentialListComponent},
    {path: 'connections/:id/edit', component: ConnectionEditComponent},
    {path: 'connections/new', component: ConnectionEditComponent},
    {path: 'connections/:id', component: ConnectionViewComponent},
    {path: 'connections', component: ConnectionListComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
