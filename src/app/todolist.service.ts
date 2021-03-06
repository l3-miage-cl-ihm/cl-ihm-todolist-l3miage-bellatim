import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, map, share } from 'rxjs';

export interface TodoItem {
  readonly label: string;
  readonly isEditing: boolean;
  readonly isDone: boolean;
  readonly id: number;
}

export interface TodoList {
  readonly label: string;
  readonly items: readonly TodoItem[];
}

let idItem = 0;

@Injectable({
  providedIn: 'root'
})
export class TodolistService {
  

  
  private subj = new BehaviorSubject<TodoList>({label: 'TODO', items: [] });
  readonly observable = this.subj.asObservable();

  private dbPath='/todoList';
  listDB!: AngularFirestoreCollection<TodoList>;


  constructor(private db: AngularFirestore) {
    this.listDB=db.collection(this.dbPath);
    // this.toto=db.collection(this.dbPath).valueChanges();
  }


  //load pour ctrlz 
  load(data: TodoList){
    this.subj.next(data);
  }


  //suppression de liste dans firestore
 

  //retrieve data from firestore

  firestoreObs!:any;
  lastId:number=0;
  loadData(id: string){
// on reprend les données enregistrées dans le localStorage puis
    // on les envoie dans le behaviour subjecteur 
    // var retrievedData=localStorage.getItem('data');
    // if(retrievedData){
    //   this.subj.next(JSON.parse(retrievedData));
    // }
  
   this.firestoreObs= this.listDB.snapshotChanges().pipe(
      map(changes =>
        changes.map(
          c => ({id: c.payload.doc.id,...c.payload.doc.data()})
        )
        )
    ,share()).subscribe(data => {
      data.forEach(
        a => {console.log("load");
          if(a.id==id){
            console.log("aid: "+a.id);
            this.subj.next({label:a.label, items: a.items});
          }
        }
      )
     } );


    
    
  }

  updateLabel(title:string){
      const L = this.subj.value;
      this.subj.next( {...L,label:title
      } );
      return this;
  }

  reinit(){
    this.subj.next({label:'',items:[]});
  }

  create(...labels: readonly string[]): this {

    const L: TodoList = this.subj.value;
    this.subj.next( {
      ...L,
      items: [
        ...L.items,
        ...labels.filter( l => l !== '').map(
            label => ({label,
               isEditing:false, isDone: false, id: idItem++})
          )
      ]
    } );

    // this.listRef.doc('id').set(this.subj.value);
    return this;
  }

  delete(...items: readonly TodoItem[]): this {
    const L = this.subj.value;
    this.subj.next( {
      ...L,
      items: L.items.filter(item => items.indexOf(item) === -1 )
    } );
    // this.listRef.doc('id').set(this.subj.value);
    return this;
  }

  update(data: Partial<TodoItem>, ...items: readonly TodoItem[]): this {
    console.log("updagte");
    if(data.label !== "") {
      const L = this.subj.value;
      this.subj.next( {
        ...L,
        items: L.items.map( item => items.indexOf(item) >= 0 ? {...item, ...data} : item )
      } );
    } else {
      this.delete(...items);
    }
    // this.listRef.doc('id').set(this.subj.value);
    return this;
  }

  // checkAll(){
  //   console.log("checkall");

  //   L.items.map(item =>{
  //     console.log("test");
  //     ({label:item.label, isEditing:item.isEditing, isDone:true, id:item.id})});

  //   this.subj.next(L);
  // }

  // doneAll(){
  //   const L = this.subj.value;
  //   this.subj.next(L.items.map(item => ({...item, isDone: true, ...item})));

    
  
}
