import { Component, OnInit, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { HistoryService, History } from '../history.service';
import { TodoItem, TodoList, TodolistService } from '../todolist.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[TodolistService, HistoryService]
})
export class TodoListComponent implements OnInit {

  obsToDo: Observable<TodoList>;
  obsHistory: Observable<History<TodoList>>;
  isDisabled: string = "disabled";
  save!: TodoList;
  isEditable: boolean=false;
  remaining=0;

  showAll=true;
  showDone=false;
  showActive=false;


  //sauvegarder avec document  nom auth
  // private todoDoc!: AngularFirestoreDocument<TodoList>; , private afs: AngularFirestore
  listDB!: AngularFirestoreCollection<TodoList>;
  constructor(private auth: AngularFireAuth,private toDoService: TodolistService, private HS: HistoryService<TodoList>, private db: AngularFirestore) { 
    this.obsToDo=this.toDoService.observable;
    this.obsHistory=this.HS.observable;

    this.listDB=db.collection('/todoList');
    // this.obsToDo=this.listDB.doc('id').get();
    // this.listDB.valueChanges();
  

  }

    //on charge les données a l'abonnement

  ngOnInit(): void {
    this.toDoService.loadData();
    console.log("onInit");

    // this.listDB.doc('id').get().then(data =>{
    //   console.log("getId");
    //  this.toDoService.load(data.data() || {label: 'TODO', items: [] })}).unsubscribe();
    this.count();

  }

  @HostListener('document:keydown.control.z') undo(event: KeyboardEvent) { 
    this.annuler();  
  } 

  @HostListener('document:keydown.control.y') redo(event: KeyboardEvent) { 
    this.refaire();  
  } 

  //on s'abonne a l'observable pour pouvoir le mettre dans le localStorage, push dans l'historique et unsubscribe pour eviter les doublons
  private saveState(){
    // var username: string;
    // this.auth.user.subscribe(data =>{ 'id'=data?.displayName != null }).unsubscribe;
      this.obsToDo.subscribe(data=>{
        this.listDB.doc('id').set(data);
        localStorage.setItem('data',JSON.stringify(data));
        this.HS.push(data);
      }).unsubscribe();
  }

//   private saveState(){
//     this.obsToDo.subscribe(data=>{
//       localStorage.setItem('data',JSON.stringify(data));
//       this.HS.push(data);
//     }).unsubscribe();
// }

  // //enlever
  // editable(){
  //   this.isEditable=!this.isEditable;
  // }

    //ajoute un item dans la liste
    add(label: string){
    this.toDoService.create(label);
    this.saveState();
    this.count();
    // this.afs.collection("items").add(label);
  }

  // saveDB(){
  //   this.todoDoc=this.afs.doc('todolist');
  // }

  //supprime un item de la liste
  delete(item: TodoItem){
    this.toDoService.delete(item);
    this.saveState();
    this.count();
  }

  //met a jour un item de la liste
  update(data :Partial<TodoItem>,item: TodoItem){
    this.toDoService.update(data, item);
    this.saveState();
    this.count();
    
  }
  
  annuler(){
    var canUndo=false;
    var currentIndex=0;
    this.obsHistory.subscribe(data=>currentIndex=data.currentIndex).unsubscribe();
    if(currentIndex>1){
      this.HS.undo();
      this.obsHistory.subscribe(data=>{
        this.toDoService.load(data.current);
        localStorage.setItem('data',JSON.stringify(data.current));
      }).unsubscribe();
    }
    this.count();

  }

  refaire(){
    var currentIndex=0;
    var length=0;
    this.obsHistory.subscribe(data=>{
      currentIndex=data.currentIndex;
      length=data.history.length;
    }).unsubscribe();

    if(currentIndex<length){
      this.HS.redo();
      this.obsHistory.subscribe(data=>{
        this.toDoService.load(data.current);
        localStorage.setItem('data',JSON.stringify(data.current));
      }).unsubscribe();
    }
    this.count();

  }

  //recupere la liste des items, compte le nombre ditem restant avec un reduce puis se desabonne
  count(){
    this.obsToDo.subscribe(data=>this.remaining=data.items.reduce((acc, item)=>(!item.isDone)?acc+1:acc,0)).unsubscribe();
  }
  //en cours d'edition ou pas
  changeEdit(isEditing: boolean, item: TodoItem){
    this.toDoService.update({isEditing:!isEditing}, item);
    
  }

  //on met show a true a tous les item
  filterAll(){
    this.showAll=true;
    if(this.showAll){
      this.showActive=false;
      this.showDone=false;
    }
  }

  //on met show a false aux item done
  filterActive(){
    this.showActive=true;
    if(this.showActive){
      this.showAll=false;
      this.showDone=false;
    }
  }

  //on met show a true aux item done
  filterDone(){
    this.showDone=true;
    if(this.showDone){
      this.showAll=false;
      this.showActive=false;
    }

    

  }

  deleteDone(){
    this.obsToDo.subscribe(data => data.items.forEach(
        item => {if(item.isDone){this.toDoService.delete(item)}
          })).unsubscribe();

  this.count();
  this.saveState();
  }

  checkAll(items: readonly TodoItem[]){
    this.toDoService.update({isDone:true}, ...items);
    this.count();
    this.saveState();


  }



   //pour ne pas perdre le focus quand on met a jour un item
   trackByFn(index: number, item: TodoItem){
    return index;
   }

}
