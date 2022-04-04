import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { TodoItem, TodoList, TodolistService } from '../todolist.service';

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
          c => ({id: c.payload.doc.id,...c.payload.doc.data()})
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
  }

  newList(){

  }

  changeList(lala:string){
    console.log(lala);
    this.idList.emit(lala);
    
  }
  

}
