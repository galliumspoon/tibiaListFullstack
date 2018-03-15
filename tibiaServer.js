const cookieSession = require('cookie-session')
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient

app.use(express.static(__dirname + '/public/'));

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))

app.use(bodyParser.json())

//functions!!
//getting quantities into a list so we can find the biggest
var getReuseNums = function(results) {
  let numsReuse = []
  for (var i = 0; i < results.length; i++) {
    if (results[i].itemReusable) {
      numsReuse.push(parseInt(results[i].itemQuantity))
    }
  }
  return numsReuse
}

var getDisposableNums = function(results) {
  let numsDispose = []
  for (var i = 0; i < results.length; i++) {
    if (results[i].itemReusable == null) {
      numsDispose.push(parseInt(results[i].itemQuantity))
    }
  }
  return numsDispose
}

//getting the keys to the graphs function
var getReuseKeys = function(list) {
  let maxList = Math.max(...list)
  //gets biggest num
  let numMod = ((maxList - (maxList % 5)) / 5) + 1
  let keys = []
  for (var i = numMod; i > -1; i--) {
    keys.push(i * 5)
  }
  return keys
}

var getDisposableKeys = function(list) {
  let maxList = Math.max(...list)
  //console.log(maxList)
  //gets biggest num
  let numMod = ((maxList - (maxList % 50)) / 50) + 1
  //console.log(numMod)
  let keys = []
  for (var i = numMod; i > -1; i--) {
    keys.push(i * 50)
  }
  return keys
}

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
    //console.log(results)

    res.render('index.ejs', {items: results})
  })

})

//graphs
app.get('/graphs', function (req, res) {
  db.collection('items').find().toArray(function(err, results) {
    //getting keys for reusable graph
    let reuseNums = getReuseNums(results)
    let reuseKeys = getReuseKeys(reuseNums)

    //getting keys for disposable graph
    let disposeNums = getDisposableNums(results)
    let disposeKeys = getDisposableKeys(disposeNums)


    res.render('graphs.ejs', {items: results, reuseKeys: reuseKeys, disposeKeys: disposeKeys})
  })
})

// //admin access
// app.get('/admin', function(req, res) {
//   var passedVariable = req.query.isAdmin
//   if (passedVariable == 'true') {
//     db.collection('childItems').find().toArray( function(err, childItems) {
//       db.collection('childDeletes').find().toArray( function(err, childDeletes) {
//         items = childItems
//         deletes = childDeletes
//         // render the admin
//         res.render('admin.ejs', {items: items, deletes: deletes, isAdmin: passedVariable});
//       })
//     })
//         //show/hide links based on admin
//   }
//   else if (passedVariable == 'false'){
//     res.redirect('/add/?isAdmin=false')
//   }
//   else {
//     res.redirect('/joinin');
//   }
// })

//login page
app.get('/joinin', function(req, res) {
  res.render('joinin.ejs', {exists: null, error: null})
})

//logout
app.get('/logout', function(req, res) {
  res.redirect('/joinin');
});

//everyone logged in page
app.get('/add', function(req, res) {
  var passedVariable = req.query.isAdmin
  //console.log(passedVariable)
  if (passedVariable != null) {
    //console.log("logged in")
    if (passedVariable) {
      db.collection('items').find().toArray(function(err, results) {
        res.render('add.ejs', {items: results, isAdmin: passedVariable})
      })
      //show/hide links based on admin
    }
    else {
      res.redirect('/joinin');
    }
  }
})

//deleting an item
app.delete('/items', function(req, res) {
  // if (req.body.isAdmin == true) {
    //console.log("admindidit")
    db.collection('items').findOneAndDelete({itemSerial: req.body.itemSerial},
    function (err, res){
      if (err) console.log(err)
      //console.log('ur stuff is delets')
      //res.redirect('/add/?isAdmin=true')
    })
  // }
  // else {
  //   console.log("a child did this")
  //   db.collection('childDeletes').save(req.body, function (err, result) {
  //     if (err) return console.log(err)
  //
  //     console.log('saved to child database')
  //     res.redirect('/add/?isAdmin=false')
  //   })
  // }
})

// //setting up a delete for kiddos add requests
// app.delete('/iteems', function (req, res) {
//   db.collection('childItems').findOneAndDelete({itemSerial: req.body.itemSerial},
//   function (err, res){
//     if (err) console.log(err)
//     console.log('ur add req is delet')
//     res.redirect('/add/?isAdmin=true')
//   })
// })

// //setting up a delete for kiddos
// app.delete('/deletes', function (req, res) {
//   db.collection('childDeletes').findOneAndDelete({itemSerial: req.body.itemSerial},
//   function (err, res){
//     if (err) console.log(err)
//     console.log('ur req is delet')
//     res.redirect('/add/?isAdmin=true')
//   })
// })

//posting an item
app.post('/items', function (req, res) {
  // if (req.body.isAdmin) {
    //console.log("admindidit")
    db.collection('items').save(req.body, function (err, result) {
      if (err) return console.log(err)

      //console.log('saved to database')
      res.redirect('/add/?isAdmin=true')
    })
 //  }
 //  else {
 //    console.log("a child did this")
 //    //save child items as single
 //    db.collection('childItems').save(req.body, function (err, result) {
 //      if (err) return console.log(err)
 //
 //      console.log('saved to child database')
 //      res.redirect('/add/?isAdmin=false')
 //    })
 // }
})

// //deleting on add
// app.post('/deletes', function (req, res) {
//   console.log("a child did this")
//   //save child items as single
//   db.collection('childDeletes').save(req.body, function (err, result) {
//     if (err) return console.log(err)
//     console.log('saved to child database')
//     res.redirect('/add/?isAdmin=false')
//   })
// })


//adding a new user
app.post('/register', function (req, res) {
  db.collection('users').find({ email: req.body.email }).toArray( function(err, user) {
    if (user.length == 0) {
      let newUser = {
        username : req.body.username,
        email : req.body.email,
        password : req.body.pass,
        admin : req.body.admin
      }
      req.session.user = newUser;
      db.collection('users').save(newUser, function (err, result) {
        if (err) {
          req.session.reset()
          return console.log(err)
        }
        else {
          //console.log('saved user to database')
          if (req.body.admin) {
            res.redirect('/add/?isAdmin=true')
          }
          else {
            res.redirect('/add/?isAdmin=false')
          }
        }
      })
    }
    //if you dont
    else {
        res.render('joinin.ejs', { exists: req.body.email, error: null })
    }
  })
})

//login
app.post('/login', function (req, res) {
  db.collection('users').find({ email: req.body.emailLogin }).toArray( function(err, user) {
  //if you find no user
    if (user.length == 0) {
        res.render('joinin.ejs', { exists: null, error: 'Invalid email or password.' })
      }
    //if you find a user
    else {
      if (req.body.passLogin == user[0].password) {
        // sets a cookie with the user's info
        //console.log(user[0].admin)
        if (user[0].admin == 'on') {
          //console.log('tru')
          res.redirect('/add/?isAdmin=true')
        }
        else {
          //console.log('false')
          res.redirect('/add/?isAdmin=false')
        }
      }
      else {
        res.render('joinin.ejs', { exists: null, error: 'Invalid email or password.' })
      }
    }
  })
})
