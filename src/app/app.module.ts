import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { UsersComponent } from './views/users/users.component';

import { StorageProviderService } from './services/storage-provider.service';
import { AppRoutingModule } from './app-routing.module';
// import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [StorageProviderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
 