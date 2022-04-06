import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HistoryService , History} from './history.service';
import { TodoItem, TodoList, TodolistService } from './todolist.service';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {
  title = 'l3m-tpX-todolist-angular-y2022';  
  userId = 'id';
  idList = '';
currentPath!:string;
  constructor(public auth: AngularFireAuth, public router:Router){
    // currentPath=router.isActive('list',false);

  }

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    // if(this.auth){
    //   console.log("navigate");
    //   this.router.navigate(['/list']);
    // }
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
