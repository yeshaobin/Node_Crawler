const Crawler = require('Crawler');
const myQuery = require('./tools/sqlQuery');

var c = new Crawler({
  maxConnections: 10,
  // 这个回调每个爬取到的页面都会触发
  callback:async  function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      // $默认使用Cheerio
      // 这是为服务端设计的轻量级jQuery核心实现

      let reg = /\(\d+\)/g
      let text = $('.git_tags>a').text()
      text = text.replace(reg, ' ')
      let arr = text.trim().split('  ')
      arr = arr.map(item=>`("${item}")`)
      text = arr.join(',')
      console.log("text", text);
      await myQuery(`insert into tag (tag) values ${text}`)
    }
    done();
  }
});
c.queue('https://sobooks.cc/books/16403.html')