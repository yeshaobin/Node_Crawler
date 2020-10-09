var Crawler = require("crawler");
const myQuery = require('./tools/sqlQuery');
let pagelist = Array.from({length:284},(item,index)=>{
  return `https://sobooks.cc/page/${index+1}`
})
let getList = new Crawler({
  rateLimit: 1000,
  maxConnections:1,
  method:'POST',
  headers: {
    "user-agent":"Mozilla/5.0 (Linux; Android 7.0; PRO 7-H Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/45016 Mobile Safari/537.36 MMWEBID/5302 MicroMessenger/7.0.8.1540(0x27000834) Process/tools NetType/WIFI Language/zh_CN ABI/arm64",
    "referer":"https://sobooks.cc/",
    "content-type": "application/x-www-form-urlencoded"
  },
  // 这个回调每个爬取到的页面都会触发
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      let arrDetail = []
      var $ = res.$;
      // $默认使用Cheerio
      // 这是为服务端设计的轻量级jQuery核心实现
      // console.log($('.thumb-img>a'));
      $('.thumb-img>a').each((index,item)=>{
        // console.log('index',index)
        console.log('item',$(item).attr('href'))
        arrDetail.push($(item).attr('href'))
      })
      getDetail.queue(arrDetail)  

    }
    done();
  }
})
let getDetail=new Crawler({
  //这里的配置和request模块是一样
  priority:6,
  rateLimit: 150,
  maxConnections:3,
  method:'POST',
  form:{
    e_secret_key:991188
  },
  headers: {
    "user-agent":"Mozilla/5.0 (Linux; Android 7.0; PRO 7-H Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/45016 Mobile Safari/537.36 MMWEBID/5302 MicroMessenger/7.0.8.1540(0x27000834) Process/tools NetType/WIFI Language/zh_CN ABI/arm64",
    "referer":"https://sobooks.cc/",
    "content-type": "application/x-www-form-urlencoded"
  },
  // preRequest:(options)=>{
  //   console.log(options)
  // },
 
  callback: async function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      // res.request.method="POST"

      // $默认使用Cheerio
      // 这是为服务端设计的轻量级jQuery核心实现
      let title,imgsrc,author,tags,pubtime,rate,ISBN,looks,detail,baiduCode,downloadurl1,downloadurl2,downloadurl3;
      try {
        title=$('.article-title a').text();
        imgsrc=$('.bookpic img').attr('src');
        author = $('.bookinfo li:nth-of-type(2)').text().substr(3)
        looks = $('.bookinfo li:nth-of-type(3)').text().substr(3)
        tags = $('.bookinfo li:nth-of-type(4)').text().substr(3)
        pubtime = $('.bookinfo li:nth-of-type(5)').text().substr(3)
        if(/\d/.test($('.bookinfo li:nth-of-type(6) b').attr('class'))){
          rate = /\d/.exec($('.bookinfo li:nth-of-type(6) b').attr('class'))[0]
        }else{rate=0}
        ISBN =  $('.bookinfo li:nth-of-type(7)').text().substr(5)
        detail=$('p').text()
        // downloadurls = $('.e-secret a')
        downloadurl1 = $($('a[rel="nofollow"]')[0]).attr('href')&&$($('a[rel="nofollow"]')[0]).attr('href').replace('https://sobooks.cc/go.html?url=','')
        downloadurl2 = $($('a[rel="nofollow"]')[1]).attr('href')&&$($('a[rel="nofollow"]')[1]).attr('href').replace('https://sobooks.cc/go.html?url=','')
        downloadurl3 = $($('a[rel="nofollow"]')[3]).attr('href')&&$($('a[rel="nofollow"]')[3]).attr('href').replace('https://sobooks.cc/go.html?url=','')
        // downloadurl4 = $($('a[rel="nofollow"]')[0]).attr('href').attr('href')&&$($('a[rel="nofollow"]')[0]).attr('href').replace('https://sobooks.cc/go.html?url=','')
        // downloadurl5 = $($('a[rel="nofollow"]')[1]).attr('href')&&$($('a[rel="nofollow"]')[1]).attr('href').replace('https://sobooks.cc/go.html?url=','')
        baiduCode = $('.e-secret b').text()||null
      } catch (error) {
        console.log(error)
      }
     
      // console.log("detail", detail);
      let sql = `insert into bookdetail 
      (title,imgurl,author,pubtime,rate,ISBN,looks,detail,downloadurl1,downloadurl2,downloadurl3,baiduCode) values
      (?,?,?,?,?,?,?,?,?,?,?,?)
      `;
      tags=tags.split(' ')
      await myQuery(sql,[title,imgsrc,author,pubtime,rate,ISBN,looks,detail,downloadurl1,downloadurl2,downloadurl3,baiduCode]).catch(console.log)
      tags.forEach(async (tag)=>{
        let res1 = await myQuery(`INSERT IGNORE INTO tag (tag) VALUES ('${tag}')`)
        // console.log("res1", res1);
        let sql2 = `INSERT INTO book_tag (bookid,tagid) VALUES ((select id from bookdetail WHERE title = "${title}" limit 0,1),(SELECT id FROM tag where tag = "${tag}" limit 0,1))`
        let res2 = await myQuery(sql2).catch(console.log)
        // console.log("res", res2);

      })
      console.log(title+'爬取完成');
    }
    done();
  }
})
// getDetail.on('request',(options)=>{
//   console.log(options)
// })
getDetail.on('schedule',function(options){
  console.log('队列加入:'+options.uri)
  console.log('队列数量:'+getDetail.queueSize)
});
// getDetail.queue('https://sobooks.cc/books/16403.html')
// getList.queue('https://sobooks.cc/page/1')
getList.queue(pagelist) //爬虫开始的地方

