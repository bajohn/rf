import { Component, OnInit } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { WsService } from './services/ws.service';
import { position } from './types';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {



  boxPosition: position = { x: 100, y: 200 };


  constructor(
    private ws: WsService
  ) {
  }

  ngOnInit() {

  }

  click_broadcast() {
    console.log('broadcast');
    this.ws.next({
      action: 'send-message', message: {
        broadcast_message: { x: 123 }
      }
    });
  }

  click_clear() {
    console.log('delete');
    this.ws.next({ action: 'clear-connections', message: {} });

  }






}
