import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { CardComponent } from './subcomponents/card/card.component';
import { CreateRoomComponent } from './pagecomponents/createroom/createroom.component';
import { RoomComponent } from './pagecomponents/room/room.component';

 
@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    CreateRoomComponent,
    RoomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
