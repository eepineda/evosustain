import { NewsApiService } from './../../news-api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  like: any = 0;
  lik1: Number = 1;
  mArticles: Array<any>
  mSources: Array<any>

  constructor(private newsapi: NewsApiService) {
    console.log('app component constructur called');
  }

  ngOnInit() {
    this.newsapi.initArticles().subscribe(data => {
      this.mArticles = data['articles']
      console.log(this.mArticles);
    });

    this.newsapi.initSources().subscribe(data => {
      this.mSources = data['sources']
      console.log(this.mSources);
    })

  }

  searchArticles(sources) {
    console.log(sources)
    this.newsapi.getArticleByID(sources).subscribe(data => {
      this.mArticles = data['articles']
    });
  }
  likeButton(index, event) {
    let id = event.target.id;
    console.log(event);
    console.log(index);
    if (index == id) {
      this.like++;
      console.log("enterinto if");
    } else {
      console.log("enter into else");
    }
    //  this.like++;
    //return index;
  }
}
