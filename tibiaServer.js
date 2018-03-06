const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient

//app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


//setting up mongodb
var db

MongoClient.connect('mongodb://galliumspoon:gallium5poon@ds251588.mlab.com:51588/tibialist', function (err, client) {
    if (err) {
      return console.log(err)
    }

    db = client.db('tibialist')

    app.listen(3000, function() {
      console.log('listening on 3000')
    })
})

//setting up sections
//home page
app.get('/', function (req, res) {
  db.collection('items').find().toArray(function(err, results) {
    console.log(results)

    res.render('index.ejs', {items: results})
  })

})
//graphs
app.get('/graphs', function (req, res) {
  db.collection('items').find().toArray(function(err, results) {
    console.log(results)

    res.render('graphs.ejs', {items: results})
  })
})

//deleting an item
app.delete('/items', (req, res) => {
  console.log(req.body.itemSerial)
  db.collection('items').findOneAndDelete({itemSerial: req.body.itemSerial},
  function (err, res){
    if (err) console.log(err)
    console.log('ur shit is delets')
  })
})

//posting an item
app.post('/items', function (req, res) {
  db.collection('items').save(req.body, function (err, result) {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
})



// var dels = document.getElementsByClassName('delbutton')
//
// for (let i = 0; i < dels.length; i++) {
//
// }

//LOOK UP EXPRESS ROUTER
