import { Component, OnInit } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  constructor() {

  }

  ngOnInit(){
    this.initws();
  }

  async initws() {

    const url = 'wss://acyiae8dc2.execute-api.us-east-1.amazonaws.com/dev'
    const ws = new WebSocket(url);
    console.log(ws);
    //const myWebSocket: WebSocketSubject<any> = webSocket(url);
    //myWebSocket.asObservable().subscribe(dataFromServer => {console.log(dataFromServer)});
    //myWebSocket.next({action: 'connect'});
    //console.log(myWebSocket);
  }
  async inithttp(){
    console.log('ON');
    const reqBody = {
      action: '$connect'
    }
    const req: RequestInit =  {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(reqBody) // body data type must match "Content-Type" header
    };
    const url = 'https://acyiae8dc2.execute-api.us-east-1.amazonaws.com/dev/@connections';
    const resp = await fetch(url, req);

    console.log('resp', resp);

    
  }

}
