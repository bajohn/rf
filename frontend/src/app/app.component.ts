import { Component, OnInit } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
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
  boxBeingDragged = false;

  boxPosition: { x: number, y: number };


  constructor() {
  }

  ngOnInit() {
    const url = `wss://${this.apiId}.execute-api.us-east-1.amazonaws.com/dev_stage`;
    this.ws = webSocket(url);
    this.ws.asObservable().subscribe(
      data => this.parseMsgFromWs(data));
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

  move_box(x: number, y: number) {
    setInterval(() => {
      const startMsg = {
        x: 0,
        y: 0,
        cardValue: '9C'
      };
      this.sendToWs('card-move-start', startMsg);
      const endMsg = {
        x: 400,
        y: 0,
        cardValue: '9C'
      };
      this.boxPosition = { x: 400, y: 0 };
      this.sendToWs('card-move-end', endMsg);
      setTimeout(() => {
        const startMsg = {
          x: 400,
          y: 0,
          cardValue: '9C'
        };
        this.sendToWs('card-move-start', startMsg);
        const endMsg = {
          x: 0,
          y: 0,
          cardValue: '9C'
        };
        this.boxPosition = { x: 0, y: 0 };
        this.sendToWs('card-move-end', endMsg);
      }, 1000)

    }, 3000)
  }


  moveStarted(dragStart: CdkDragStart) {
    this.boxBeingDragged = true;
    console.log(dragStart);
    const xyPos = dragStart.source.getFreeDragPosition()
    const startMsg = {
      x: xyPos.x,
      y: xyPos.y,
      cardValue: '9C'
    };
    this.sendToWs('card-move-start', startMsg);
  }

  moveEnded(dragEnd: CdkDragEnd<any>) {
    console.log(dragEnd);
    const xyPos = dragEnd.source.getFreeDragPosition()

    const endMsg = {
      x: xyPos.x,
      y: xyPos.y,
      cardValue: '9C'
    };
    this.sendToWs('card-move-end', endMsg);
    this.boxBeingDragged = false;
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

  parseMsgFromWs(data: iWsMsg) {
    console.log(data);
    if (data.action === 'card-move-end') {
      this.boxPosition = { x: Number(data.message['x']), y: Number(data.message['y']) }
    }
  }

  isActive() {
    return this.boxBeingDragged;
  }



}

interface iWsMsg {
  action: endpoint
  message: {
    game_id: string
    [key: string]: string | number
  }
}

type endpoint = 'initialize' | 'send-message' | 'clear-connections' | 'card-move-start' | 'card-move-end';