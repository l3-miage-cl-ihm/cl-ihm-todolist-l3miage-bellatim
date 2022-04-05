import { Component, OnInit, ChangeDetectionStrategy, HostListener, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
// import { stringify } from 'querystring';
import { BehaviorSubject, map, Observable, share } from 'rxjs';
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


  /**Limitations:
   * L'application bug quand on fait ctrl z on ctrly
   * pour annuler ou revenir en vant lorsqu'on a changé
   * de liste
   */

  //sauvegarder avec document  nom auth
  // private todoDoc!: AngularFirestoreDocument<TodoList>; , private afs: AngularFirestore
  listDB!: AngularFirestoreCollection<TodoList>;

  //nombre d'item restant
  countRemaining = new BehaviorSubject<number>(0);

  @Input() userName!: string;
  @Input() userId!: string;
  @Input() isAnon!: boolean;

  // @Input() listId='';

  subscribed=false;

  constructor(private sanitizer: DomSanitizer, private toDoService: TodolistService, private HS: HistoryService<TodoList>, private db: AngularFirestore) { 
    this.obsToDo=this.toDoService.observable;
    this.obsHistory=this.HS.observable;

    this.listDB=db.collection('/todoList');
    // this.obsToDo=this.listDB.doc('id').get();
    // this.listDB.valueChanges();
  }


  //charge la premiere liste de l'utilisateur
  //puis s'abonne au compteurs
  //et charge les noms de liste de l'utilisateur
  //on derivant un abonnement depuis le service firestore
  ngOnInit(): void {
    let id ='anon';
    if(!this.isAnon){
      // id=this.userName+":"+this.userId+this.listId;
      id=this.userName+":"+this.userId;
    }
    this.toDoService.loadData(id);
    this.count();
    this.loadLocalFilters();
    this.countRemaining.subscribe(remains => this.remaining=remains);

    // this.listDB.doc('id').get().then(data =>{
    //   console.log("getId");
    //  this.toDoService.load(data.data() || {label: 'TODO', items: [] })}).unsubscribe();
    // this.count();

    //init de selection
    this.obsList=this.listDB.snapshotChanges().pipe(
      map(changes =>
        changes.map(
          c => ({id: c.payload.doc.id,label:c.payload.doc.data().label})
        ).filter(c => c.id.includes(this.userName))
        ), share());
    this.countList();

  }

  downloadUri!:SafeUrl;

  //exxporter une liste en JSON
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

  //importer une liste JSON
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
      alert("Fichier importé aves succès");
    }
    }
    fileReader.onerror = (error) => {
    console.log(error);
    alert("Erreur fichier")
    }
  }

  generateQRcode(){
    
  }

  //sauvegarde les files de manière locale
  saveLocalFilters(){
    localStorage.setItem('showAll',JSON.stringify(this.showAll));
    localStorage.setItem('showDone',JSON.stringify(this.showDone));
    localStorage.setItem('showActive',JSON.stringify(this.showActive));
  }

  //charge les filtres (de manière locale)
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



  ngOnDestroy(){

  }

  @HostListener('document:keydown.control.z') undo(event: KeyboardEvent) { 
    this.annuler();  
  } 

  @HostListener('document:keydown.control.y') redo(event: KeyboardEvent) { 
    this.refaire();  
  } 

  //on s'abonne a l'observable pour pouvoir le mettre dans le localStorage, push dans l'historique et unsubscribe pour eviter les doublons
  //charge la sauvegarde courante
  private saveState(){
    
    // var username: string;
    // this.auth.user.subscribe(data =>{ 'id'=data?.displayName != null }).unsubscribe;
    let id ='anon';
    if(!this.isAnon){
      id=this.userName+":"+this.userId+this.idList;
      // id=this.userName+":"+this.userId; //Save
      console.log("id: "+id);
    }
    this.obsToDo.subscribe(data=>{
      this.listDB.doc(id).set(data);
      // localStorage.setItem('data',JSON.stringify(data));
      this.HS.push(data);
      console.log("saving");
    }).unsubscribe();
    
  }

  //charge une sauvegarde précise
  saveData(data: TodoList){

    let id ='anon';
    if(!this.isAnon){
      id=this.userName+":"+this.userId+this.idList;
      // id=this.userName+":"+this.userId; //save
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
  
  //undo
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

  //redo
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

  //supprime les items selectionnés
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


   obsList!: Observable<any>;


   listNb=0;


  //compte le nombre de liste de l'utiliasteur
  countList(){
    this.obsList.subscribe(data => {this.listNb=data.length
      // this.listNb=data.reduce((acc:number)=>(acc));
    });
  }


  idList='';

  //creer une nouvelle liste voir aves les sauvegardes
  newList(){
 //premiere liste c'est nom: uid
 //si index=0 c'est la premiere
 //si index=1
   this.toDoService.reinit();
    console.log(this.listNb.toString());
    let id ='anon';
    this.idList=this.listNb.toString();
    if(!this.isAnon){
      // id=this.userName+":"+this.userId+this.listId;
      id=this.userName+":"+this.userId+this.idList;
    }
    this.listDB.doc(id).set({label: 'TODO', items: [] }); //creation liste vierge
    this.toDoService.loadData(id); //chargelent liste vierge
    this.loadLocalFilters();
    this.countRemaining.subscribe(remains => this.remaining=remains);
    // this.idList.emit(this.listNb.toString());

    this.selected=this.listNb;
  }

  //change de liste
  selected=0;
  changeList(id:string, i:number){
    //il faut veilleur a change l'id
    // let id='anon'
    this.toDoService.reinit();
    this.selected=i;
    console.log("chargement "+id);
    // this.idList.emit(lala);
    this.idList=i.toString()=='0'?'':i.toString();
    console.log("idlist"+this.idList);
    this.toDoService.loadData(id);

    //le bug c'est de faire selectonner direct au changement ?
  }

  //utilisé pour determiner si une liste est selectionné
  //pour le css
  isSelected(index: number):boolean{
    return index==this.selected;
  }

  updateLabel(label: string){
    this.toDoService.updateLabel(label);
    this.saveState();
  }

 
  


}
