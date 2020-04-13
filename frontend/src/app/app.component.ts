import { Component, OnInit } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  ws: WebSocketSubject<any>;
  apiId = '9owex9co2e';
  game_id = 'cccc'
  constructor() {
  }

  ngOnInit() {
    this.initws();
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

  async initws() {
    const url = `wss://${this.apiId}.execute-api.us-east-1.amazonaws.com/dev`;
    this.ws = webSocket(url);
    this.ws.asObservable().subscribe(dataFromServer => { console.log(dataFromServer) });
    this.ws.next({ action: 'initialize', message: { game_id: this.game_id } });
  }


}
