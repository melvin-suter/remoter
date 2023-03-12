import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


/**********
 * PrimeNG
 **********/
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {DropdownModule} from 'primeng/dropdown';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import { TagModule } from 'primeng/tag';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {CardModule} from 'primeng/card';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './components/partials/navbar/navbar.component';
import { CredentialListComponent } from './components/pages/credentials/credential-list/credential-list.component';
import { CredentialViewComponent } from './components/pages/credentials/credential-view/credential-view.component';
import { AppLayoutComponent } from './components/layout/app-layout/app-layout.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'; // enables the application to communicate with the backend services
import { ConnectionListComponent } from './components/pages/connections/connection-list/connection-list.component';
import { ConnectionViewComponent } from './components/pages/connections/connection-view/connection-view.component';
import { ConnectionEditComponent } from './components/pages/connections/connection-edit/connection-edit.component';
import { CredentialInfoComponent } from './components/partials/credential-info/credential-info.component';
import { CopyButtonComponent } from './components/partials/copy-button/copy-button.component';
import { LoginComponent } from './components/pages/auth/login/login.component';
import { AuthLayoutComponent } from './components/layout/auth-layout/auth-layout.component';
import { BackendInterceptorService } from './services/backend-interceptor.service';
import { TagComponent } from './components/partials/tag/tag.component';
import { LogoutComponent } from './components/pages/auth/logout/logout.component';
import { HomeComponent } from './components/pages/home/home.component';
import { UserComponent } from './components/pages/auth/user/user.component';



@NgModule({
  declarations: [
    AppComponent,


    


    NavbarComponent,
    CredentialListComponent,
    CredentialViewComponent,
    AppLayoutComponent,
    ConnectionListComponent,
    ConnectionViewComponent,
    ConnectionEditComponent,
    CredentialInfoComponent,
    CopyButtonComponent,
    LoginComponent,
    AuthLayoutComponent,
    TagComponent,
    LogoutComponent,
    HomeComponent,
    UserComponent,

  ],
  imports: [

    // PrimeNG
    SidebarModule,
    ButtonModule,
    BrowserAnimationsModule,
    MenuModule,
    TableModule,
    InputTextModule,
    PasswordModule, 
    InputTextareaModule,
    ConfirmDialogModule,
    DropdownModule,
    OverlayPanelModule,
    AutoCompleteModule,
    ToastModule,
    TagModule,
    ToggleButtonModule,
    CardModule,


    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BackendInterceptorService,
      multi: true
    },
    ConfirmationService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
