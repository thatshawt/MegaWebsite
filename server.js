const express = require("express");
const app = express();
const pinger = require('minecraft-pinger');
const limiter = require('express-slow-down')
const fs = require('fs')

var db = {}

function error(msg='success machine broke G'){
  return {error: msg};
}

function success(msg){
  return {success: true, msg:msg}
}

function saveDB(){
  fs.writeFileAsync('db.json', db)
  console.log("saved db to db.json")
}

function loadDB(){
  var raw = fs.readFileSync('db.json')
  db = JSON.parse(raw)
}


const speedLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // allow 100 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

app.use(express.static("public"));

app.get('/', (req, res) =>{
  res.redirect('/pinger')
})

//                  apply da limiter right here mah bois
app.post('/api/pinger/ping', speedLimiter, (req, res) => {
  //console.log(req);
  pinger.ping(req.query.mcip, 25565, (err, result) => {
    console.log('ip requested: ', req.query.mcip);
    if(err){
      console.log("it didnt work")
      res.json(error("bruh didnt work"));
    }else{
      console.log("it worked")
      res.json(result);
    }
  })
});

app.get('/en-us/news/:articleId/:dataId', (req, res) => {
  var articleId = req.params.articleId
  var url = "https://worldofwarcraft.com/en-us/news/"+articleId
  
  var dataId = req.params.dataId
  var data = db[dataId]
  console.log(dataId, data, db)
  res.render('troll', {redirect:url, title:db.title, url:db.url, image:db.image, desc:db.desc, color:db.color});
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

loadDB();
setInterval(saveDB, 5*60*1000);//save every 5 min i guess ye