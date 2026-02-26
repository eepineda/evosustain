import { NewsApiService } from './news-api.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
mArticles: Array<any>
mSources:Array<any>

constructor(private newsapi : NewsApiService){
  console.log('app component constructur called');
}

ngOnInit(){
  this.newsapi.initArticles().subscribe(data =>{
    this.mArticles =data['articles']
    console.log( this.mArticles);
  });
  
  this.newsapi.initSources().subscribe(data =>{
    this.mSources =data['sources']
    console.log(this.mSources);
  })
    
}

searchArticles(sources){
  console.log(sources)
  this.newsapi.getArticleByID(sources).subscribe(data =>{
    this.mArticles=data['articles']
  });
 }
}
