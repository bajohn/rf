import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  shelfHeight = 40;
  shelfDrag = false;
  
  constructor() { }

}
