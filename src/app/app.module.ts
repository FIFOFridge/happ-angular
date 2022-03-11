import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { StorageProviderService } from './services/storage-provider.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [StorageProviderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
