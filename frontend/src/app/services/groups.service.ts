import { Injectable } from '@angular/core';
import { WsService } from './ws.service';
import { iWsMsg } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private ws: WsService, ) {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));

  }

  ngOnInit(): void {
  }

  parseMsgFromWs(data: iWsMsg) {
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    } else if (data.action === 'group-move-end') {
      
    }


  }

}
