const axios = require('axios')
const LRU = require('lru-cache')
const cache =new LRU({
  maxAge:1000*60*60,
  max:500
})
global.cache = cache
//先把clash代理调成全局模式
const switchMode=()=>{
  axios.patch('http://127.0.0.1:9090/configs',{
    mode:'Global'
  }).then(response=>{
    // console.log(response)
    console.log('切换全局模式')
  })
}
switchMode()
const getProxies=async ()=>{
  if(cache.get('allProxies')){
    return cache.get('allProxies')
  }
  return axios.get('http://127.0.0.1:9090/proxies').then(res=>{
    cache.set('allProxies',res.data.proxies['GLOBAL']) 
    return res.data.proxies['GLOBAL']
  })
}

const switchNode=async ()=>{
  let {now:nowProxy,all:allProxies} = await getProxies()
  console.log(nowProxy,allProxies)
  //生成[0,length)的随机数
  let randomInt = Math.ceil(Math.random()*allProxies.length);
  axios.put('http://127.0.0.1:9090/proxies/GLOBAL',{name:allProxies[randomInt]}).then(res=>{
    console.log(res)
    if(res.status==204){
      //节点更换成功
      console.log(`节点更换成功,节点更换为${allProxies[randomInt]}`)
    }
  })
}
module.exports =switchNode