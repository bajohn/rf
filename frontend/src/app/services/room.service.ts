import { Injectable, HostListener } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  shelfHeight = 40;
  shelfDrag = false;

  _headerPct = .25;
  _playTablePct = .75 * .6;
  _shelfPct = .75 * .4;



  headerPx: number;
  playTablePx: number;
  shelfPx: number;


  constructor() {
    const pct = this._headerPct + this._playTablePct + this._shelfPct;
    console.log(pct);
    if (pct !== 1) {
      throw Error('Page pct calculation does not sum to 100%');
    }
  }



  getHeaderPx(appendPx = true) {
    return this._getRet(this._headerPct, appendPx);
  }

  getPlayTablePx(appendPx = true) {
    return this._getRet(this._playTablePct, appendPx);
  }

  getShelfPx(appendPx = true) {
    return this._getRet(this._shelfPct, appendPx);
  }

  _getRet(pctIn: number, appendPx) {
    const pctNum = window.innerHeight * pctIn
    if (appendPx) {
      return this._appendPx(pctNum);
    } else {
      return pctNum as number
    }
  }


  _appendPx(height: number) {
    return `${height}px`
  }




}
