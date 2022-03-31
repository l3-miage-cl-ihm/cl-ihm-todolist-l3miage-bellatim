import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface History<T>{
  canUdo: boolean;
  canRedo: boolean;
  history: T[];
  currentIndex: number;
  current: T;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService<T> {

  private backStack = new Array<T>();
  private forwardStack = new Array<T>();
  private subj = new BehaviorSubject<History<T>>({canUdo: false, canRedo: false, history: [], currentIndex: -1, current: null!});
  readonly observable = this.subj.asObservable();
  constructor() { }
/* On renvoie lobservale surlquel le component se delacera et a une nouvelle action la veule sera renouveléé*/


  push(obj: T){
    console.log("push obj:"+obj);
    const history = this.subj.value;
    var bool = false;
    if(history.history.length>2){
      bool = true;
    }
    this.subj.next({
      canUdo:true,
      canRedo:false,
      history: [...history.history.slice(0,history.currentIndex), obj],
      currentIndex: history.currentIndex + 1,
      current: obj
    });

    console.log("current: "+this.subj.value.currentIndex);
  }

  undo(){
    console.log("undo");
    const h = this.subj.value;
    this.subj.next({
      canUdo: h.history.length>2,
      canRedo: false,
      history: h.history,
      currentIndex: h.currentIndex - 1,
      current: h.history[h.currentIndex]   
    })
    // var pop = this.backStack.pop();
    // if(pop){
    //   this.forwardStack.push(pop);
    // }
    // this.subj.next({
    //   ...h,
    //   history: [...this.backStack,...this.forwardStack],
    //   currentIndex: h.currentIndex-1,
    //   current: h.history[h.currentIndex-1]
    // })

    // this.subj.next({
    //   ...h,
    //   history: [...this.backStack,...this.forwardStack],
    //   currentIndex: h.currentIndex-1,
    //   current: h.history[h.currentIndex-1]
    // })
  }
  
}
