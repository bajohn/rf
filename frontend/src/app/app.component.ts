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


  boxPosition: { x: number, y: number };


  // @ViewChild('cdkDrag') child: CdkDrag
  //@ViewChild(CdkDrag) dragel: CdkDrag;

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
    this.boxPosition = { x: x, y: y };
  }


  moveStarted(dragStart: CdkDragStart) {
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
      this.boxPosition = { x: Number(data.message['x']) , y: Number(data.message['y']) }
    }
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