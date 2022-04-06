import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TodoItem, TodoList, TodolistService } from '../todolist.service';
import {MatDivider}  from '@angular/material/divider'

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss']
})
export class SelectionComponent implements OnInit {


  @Input() userName!: string;
  @Input() userId!: string;
  @Input() isAnon!: boolean;
  @Output() idList = new EventEmitter<string>();

  listDB!: AngularFirestoreCollection<TodoList>;

  obsList!: Observable<any>;
  
  constructor(private db: AngularFirestore) {
    this.listDB=db.collection('/todoList');
  }

  ngOnInit(): void {
    this.obsList=this.listDB.snapshotChanges().pipe(
      map(changes =>
        changes.map(
          c => ({id: c.payload.doc.id,label:c.payload.doc.data().label})
        ).filter(c => c.id.includes(this.userName))
        ));
    // ).subscribe(data => {
    //   data.forEach(
    //     a => {
    //       if(a.id==id){
    //         this.subj.next(a);
    //       }
    //     }
    //   )
    //  } );
    this.countList();
  }

  listNb=0;
  countList(){
    this.obsList.subscribe(data => {this.listNb++;
    });
  }

  newList(){
 //premiere liste c'est nom: uid
 //si index=0 c'est la premiere
 //si index=1
    console.log(this.listNb.toString());
    this.idList.emit(this.listNb.toString());
  }

  changeList(lala:string){
    console.log(lala);
    this.idList.emit(lala);

  }
  

}
