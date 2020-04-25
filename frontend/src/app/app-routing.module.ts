import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateRoomComponent } from './pagecomponents/createroom/createroom.component';
import { RoomComponent } from './pagecomponents/room/room.component';


const routes: Routes = [
  //{ path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '', component: CreateRoomComponent },
  // { path: 'samples', component: SamplesComponent },
  { path: '**', component: RoomComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
