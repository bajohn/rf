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
    if (pct !== 1) {
      throw Error('Page pct calculation does not sum to 100%');
    }
  }

  getHeaderNum(): number {
    return this._getRet(this._headerPct, false) as number;
  }

  getHeaderPx(): string {
    return this._getRet(this._headerPct, true) as string;
  }

  getPlayTableNum(): number {
    return this._getRet(this._playTablePct, false) as number;
  }

  getPlayTablePx(): string {
    return this._getRet(this._playTablePct, true) as string;
  }

  getShelfNum(): number {
    return this._getRet(this._shelfPct, false) as number
  }

  getShelfPx(): string {
    return this._getRet(this._shelfPct, true) as string;
  }



  _getRet(pctIn: number, appendPx) {
    const pctNum = window.innerHeight * pctIn
    if (appendPx) {
      return this._appendPx(pctNum);
    } else {
      return pctNum;
    }
  }


  _appendPx(height: number) {
    return `${height}px`
  }




}
