import { Component, OnInit } from '@angular/core';
import { WsService } from '../../services/ws.service';
import { iCardData, iWsMsg } from '../../types';
import { Router } from '@angular/router';
import { CardsService } from 'src/app/services/cards.service';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {





  cardTypes: string[] = [];



  constructor(
    private ws: WsService,
    private router: Router,
    public cardService: CardsService,
  ) {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
    const gameId = this.router.url.substring(1);
    this.ws.setGameId(gameId);
    this.ws.sendToWs('initialize', {});
  }

  ngOnInit() {
  }


  clickShuffleRecall() {
    this.cardService.doShuffle(false);
  }

  clickShuffleSpread() {
    this.cardService.doShuffle(true);
  }




  parseMsgFromWs(data: iWsMsg) {
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    }
    else if (data.action === 'initialize') {
      if (data.message['gameExists']) {
        console.log('found!');
      } else {
        console.log('No game found. Ask to create');
      }
    }
  }

  getCards() {
    return this.cardService.getCards();
  }




}
