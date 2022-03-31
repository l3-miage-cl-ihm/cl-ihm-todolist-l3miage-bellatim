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
  private subj = new BehaviorSubject<History<T>>({canUdo: false, canRedo: false, history: [], currentIndex: 0, current: null!});
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
    // var newHistory =history.history.push(obj);
    this.subj.next({
      canUdo:true,
      canRedo:false,
      history: [...history.history.slice(0,history.currentIndex), obj],
      currentIndex: history.currentIndex + 1,
      current: obj
    });

    console.log("historyLenghth"+this.subj.value.history.length);
    console.log("current index"+this.subj.value.currentIndex);
  }

  undo(){
    console.log("undo");
    const h = this.subj.value;
    var newIndex=h.currentIndex-1;
    this.subj.next({
      canUdo: h.history.length>2,
      canRedo: h.history.length>2,
      history: h.history,
      currentIndex: newIndex,
      current: h.history[newIndex-1]
    })
    console.log("current index: "+this.subj.value.currentIndex);
    console.log("historyLenghth"+this.subj.value.history.length);
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
