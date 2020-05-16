import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CardComponent } from './subcomponents/card/card.component';
import { CreateRoomComponent } from './pagecomponents/createroom/createroom.component';
import { RoomComponent } from './pagecomponents/room/room.component';
import { PlayerNameDialogComponent } from './subcomponents/player-name-dialog/player-name-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    CreateRoomComponent,
    RoomComponent,
    PlayerNameDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    DragDropModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
