import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {MagicBlueBulbModule} from "../lib/magic-blue-bulb.module";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MagicBlueBulbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
