import { Component, OnInit, ViewChild } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  ws: WebSocketSubject<any>;
  apiId = '9owex9co2e';
  game_id = 'cccc'
  ctr = 0;


  boxPosition = { x: 0, y: 0 };



  // @ViewChild('cdkDrag') child: CdkDrag
  //@ViewChild(CdkDrag) dragel: CdkDrag;

  constructor() {
  }

  ngOnInit() {
    const url = `wss://${this.apiId}.execute-api.us-east-1.amazonaws.com/dev`;
    this.ws = webSocket(url);
    this.ws.asObservable().subscribe(dataFromServer => { console.log(dataFromServer) });
    this.sendToWs('initialize', {});
  }

  click_broadcast() {
    console.log('broadcast');
    this.ws.next({
      action: 'send-message', message: {
        game_id: this.game_id,
        broadcast_message: { x: 123 }
      }
    });
  }

  click_clear() {
    console.log('delete');
    this.ws.next({ action: 'clear-connections', message: { game_id: this.game_id } });

  }

  click_move() {
    this.boxPosition = { x: -10, y: -10 };
  }


  moveStarted(dragStart: CdkDragStart) {
    console.log(this.boxPosition);
    const startMsg = {
      x: this.boxPosition.x,
      y: this.boxPosition.y,
      cardValue: '9C'
    };
    this.sendToWs('card-move-start', startMsg);
  }

  moveEnded(dragEnd: CdkDragEnd<any>) {
    console.log(this.boxPosition);
    const endMsg = {
      x: this.boxPosition.x,
      y: this.boxPosition.y,
      cardValue: '9C'
    };
    this.sendToWs('card-move-end', endMsg);
  }

  sendToWs(endpoint: endpoint, msgIn: { [key: string]: number | string }) {
    const msgToSend = {
      action: endpoint,
      message: Object.assign({
        game_id: this.game_id,
      }, msgIn)
    };
    this.ws.next(msgToSend);
  }



}

interface iWsMsg {
  action: endpoint
  message: {
    game_id: string
    [key: string]: string
  }
}

type endpoint = 'initialize' | 'send-message' | 'clear-connections' | 'card-move-start' | 'card-move-end';