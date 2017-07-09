import Vue from 'vue';
import axios from 'axios';

const vue_entry = new Vue({
  el: '#entry',
  data: {
    url: 'http://www.kisjam.com/blog/',
    posts: [],
    categories: [],
    errors: []
  },
  created(){
    let arr_categories = [];
    axios.get(this.url+'wp-json/wp/v2/categories/?per_page=30')
    .then(response => {
      this.categories = response.data
      for (var item of this.categories) {
        arr_categories[item.id] = item.name;
      }
    })
    .catch(e => {
      this.errors.push(e)
    });

    axios.get(this.url+'wp-json/wp/v2/posts/?per_page=5')
    .then(response => {
      this.posts = response.data
      for (var post of this.posts) {
        let date = new Date(post.date);
        let date_year = date.getFullYear();
        let date_month = date.getMonth()
        let date_day = date.getDate();
        let date_publish = date_year + '.' + date_month + '.' + date_day;
        post.categories.name = arr_categories[post.categories[0]];
        post.pubdate = date_publish;
      }
    })
    .catch(e => {
      this.errors.push(e)
    });
  }
});
