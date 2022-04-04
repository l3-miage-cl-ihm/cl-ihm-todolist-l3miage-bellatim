import { Component, OnInit, ChangeDetectionStrategy, HostListener, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
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

  //nombre d'item restant
  countRemaining = new BehaviorSubject<number>(0);

  @Input() userName!: string;
  @Input() userId!: string;
  @Input() isAnon!: boolean;

  @Input() listId='';

  subscribed=false;

  constructor(private sanitizer: DomSanitizer, private toDoService: TodolistService, private HS: HistoryService<TodoList>, private db: AngularFirestore) { 
    this.obsToDo=this.toDoService.observable;
    this.obsHistory=this.HS.observable;

    this.listDB=db.collection('/todoList');
    // this.obsToDo=this.listDB.doc('id').get();
    // this.listDB.valueChanges();
  }

  downloadUri!:SafeUrl;

  exportList(){
    

    let exportedData!:string;

    let id ='anon';
    if(!this.isAnon){
      id=this.userName+":"+this.userId;
      console.log("id: "+id);
    }
    this.toDoService.observable.subscribe(data=>{
      localStorage.setItem('data',JSON.stringify(data));
      exportedData = JSON.stringify(data);
      console.log("exporting");
    }).unsubscribe();

    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(exportedData));
    this.downloadUri = uri;
  }

  importList(file: any){
    let selectedFile = file.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(selectedFile, "UTF-8");
    fileReader.onload = () => {
    //console.log(fileReader.result.toString());
    if(fileReader.result){
      let jsonObj=(JSON.parse(fileReader.result.toString()));
      console.log("lecture fichier"+jsonObj);
      this.toDoService.load(jsonObj);
      this.saveData(jsonObj);
    }
    }
    fileReader.onerror = (error) => {
    console.log(error);
    alert("Erreur fichier")
    }
  }

  generateQRcode(){
    
  }
  saveLocalFilters(){
    localStorage.setItem('showAll',JSON.stringify(this.showAll));
    localStorage.setItem('showDone',JSON.stringify(this.showDone));
    localStorage.setItem('showActive',JSON.stringify(this.showActive));
  }

  loadLocalFilters(){
    let retrievedFilter = localStorage.getItem('showAll');
    if(retrievedFilter){
      this.showAll=(JSON.parse(retrievedFilter));
    }
    retrievedFilter = localStorage.getItem('showDone');
    if(retrievedFilter){
      this.showDone=(JSON.parse(retrievedFilter));
    }
    retrievedFilter = localStorage.getItem('showActive');
    if(retrievedFilter){
      this.showActive=(JSON.parse(retrievedFilter));
    }
  }
    //on charge les données a l'abonnement

  ngOnInit(): void {
    let id ='anon';
    if(!this.isAnon){
      id=this.userName+":"+this.userId;
    }
    this.toDoService.loadData(id);
    this.count();
    this.loadLocalFilters();

    // this.listDB.doc('id').get().then(data =>{
    //   console.log("getId");
    //  this.toDoService.load(data.data() || {label: 'TODO', items: [] })}).unsubscribe();
    // this.count();
    this.countRemaining.subscribe(remains => this.remaining=remains);

  }

  ngOnDestroy(){

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
    let id ='anon';
    if(!this.isAnon){
      id=this.userName+":"+this.userId;
      console.log("id: "+id);
    }
    this.obsToDo.subscribe(data=>{
      this.listDB.doc(id).set(data);
      // localStorage.setItem('data',JSON.stringify(data));
      this.HS.push(data);
      console.log("saving");
    }).unsubscribe();
    
  }

  saveData(data: TodoList){

    let id ='anon';
    if(!this.isAnon){
      id=this.userName+":"+this.userId;
      console.log("id: "+id);
    }
    this.listDB.doc(id).set(data);
      // localStorage.setItem('data',JSON.stringify(data));

  }



    //ajoute un item dans la liste
    add(label: string){
    this.toDoService.create(label);
    this.saveState();
    // this.afs.collection("items").add(label);
  }

  //supprime un item de la liste
  delete(item: TodoItem){
    this.toDoService.delete(item);
    this.saveState();
  }

  //met a jour un item de la liste
  update(data :Partial<TodoItem>,item: TodoItem){
    this.toDoService.update(data, item);
    this.saveState();
    
  }
  
  annuler(){
    var canUndo=false;
    var currentIndex=0;
    this.obsHistory.subscribe(data=>currentIndex=data.currentIndex).unsubscribe();
    if(currentIndex>1){
      this.HS.undo();
      this.obsHistory.subscribe(data=>{
        this.toDoService.load(data.current);
        // localStorage.setItem('data',JSON.stringify(data.current));
        this.saveData(data.current);
      }).unsubscribe();
    }

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
        // localStorage.setItem('data',JSON.stringify(data.current));
        this.saveData(data.current);
      }).unsubscribe();
    }

  }

  //recupere la liste des items, compte le nombre ditem restant avec un reduce puis se desabonne
  count(){
    // this.obsToDo.subscribe(data=>this.remaining=data.items.reduce((acc, item)=>(!item.isDone)?acc+1:acc,0)).unsubscribe();
    this.obsToDo.subscribe(data=>this.countRemaining.next(data.items.reduce((acc, item)=>(!item.isDone)?acc+1:acc,0)));

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
    this.saveLocalFilters();
  }

  //on met show a false aux item done
  filterActive(){
    this.showActive=true;
    if(this.showActive){
      this.showAll=false;
      this.showDone=false;
    }
    this.saveLocalFilters();

  }

  //on met show a true aux item done
  filterDone(){
    this.showDone=true;
    if(this.showDone){
      this.showAll=false;
      this.showActive=false;
    }
    this.saveLocalFilters();
  }

  deleteDone(){
    this.obsToDo.subscribe(data => data.items.forEach(
        item => {if(item.isDone){this.toDoService.delete(item)}
          })).unsubscribe();

  this.saveState();
  }

  
  //Check tous les items (ou deselectionne si il le sont déjà)
  checkAll(items: readonly TodoItem[]){
    let allChecked!:boolean;
    this.countRemaining.subscribe(i => {
      allChecked=(i==0);
    }).unsubscribe;
    this.toDoService.update({isDone:!allChecked}, ...items);
    this.saveState();


  }



   //pour ne pas perdre le focus quand on met a jour un item
   trackByFn(index: number, item: TodoItem){
    return index;
   }

}
