import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParamsService {

  readonly shelfCardSpacing = 60;
  readonly spreadCardSpacing = 20;
  readonly shelfCardShift = 100;
  readonly cardSizeFactor = 1.2;
  readonly cardClickTime = 100;


  constructor() { }
}
