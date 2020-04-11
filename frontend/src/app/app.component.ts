import { Component, OnInit } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  ws: WebSocketSubject<any>
  game_id = 'jjjj'
  constructor() {
    this.initws();
  }

  ngOnInit() {
    this.initws();
  }

  click_broadcast() {
    console.log('broadcast');
    this.ws.next({ action: 'send_message', message: {
      game_id: this.game_id,
      msg: 'Hello world'
    } });
  }

  click_clear() {
    console.log('delete');
    this.ws.next({ action: 'clear_connections', message: '' });

  }

  async initws() {
    const url = 'wss://9owex9co2e.execute-api.us-east-1.amazonaws.com/dev';
    this.ws = webSocket(url);
    this.ws.asObservable().subscribe(dataFromServer => { console.log(dataFromServer) });
  }


}
