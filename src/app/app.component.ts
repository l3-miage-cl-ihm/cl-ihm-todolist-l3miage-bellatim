import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HistoryService , History} from './history.service';
import { TodoItem, TodoList, TodolistService } from './todolist.service';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {
  title = 'l3m-tpX-todolist-angular-y2022';  
  userId = 'id';
  idList = '';
  constructor(public auth: AngularFireAuth){
  }

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    // this.user=this.auth.user.subscribe(data => this.user=data.)
  }

  loginAnon(){
    this.auth.signInAnonymously();
  }
  logout() {
    this.auth.signOut();
  }

  changeList(){
    
  }
 

}
