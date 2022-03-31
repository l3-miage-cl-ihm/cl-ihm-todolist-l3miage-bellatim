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


  //push est appelée a chaque action par le component root
  push(obj: T){
    console.log("push obj:"+obj);
    const history = this.subj.value;
    var bool = true;
    if(history.history.length<2  && history.currentIndex==0){
      console.log("cannot undo (service push)");
      bool = false;
    }
    else{
      bool=true;
    }
    // var newHistory =history.history.push(obj);
    this.subj.next({
      canUdo:bool,
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
    var newUndo=true;
    if(h.history.length<2 || h.currentIndex==0){
      newUndo=false;
      console.log("cannot undo (service undo)");
    }
    this.subj.next({
      canUdo: newUndo,
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

  redo(){
    console.log("redo");
    const h = this.subj.value;
    var newIndex=h.currentIndex+1;
    var newRedo=true;
    if(h.history.length<2 && h.currentIndex==0){
      newRedo=false;
      console.log("cannot redo (service redo)");
    }
    this.subj.next({
      canUdo: h.history.length>2,
      canRedo: newRedo,
      history: h.history,
      currentIndex: newIndex,
      current: h.history[newIndex-1]
    })
    console.log("current index: "+this.subj.value.currentIndex);
    console.log("historyLenghth"+this.subj.value.history.length);
    // var pop = this.forwardStack.pop();
    // if(pop){
    //   this.backStack.push(pop);
    // }
    // this.subj.next({
    //   ...h,
    //   history: [...this.backStack,...this.forwardStack],
    //   currentIndex: h.currentIndex+1,
    //   current: h.history[h.currentIndex+1]
    // })
  }
  
}
