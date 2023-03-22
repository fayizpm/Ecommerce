var express = require('express');
var router = express.Router();
var mysql = require('mysql2');


db = mysql.createConnection({

  host: 'localhost',
  user: 'root',
  password: 'faris786',
  database: 'faz'

})
db.connect(function (err) {
  if (err)
    throw err
  console.log('databse connect')

})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/user', function (req, res) {
  let user = req.session.user
  if (req.session.user) {
    let name = user.username
    let id = user.id
    let sq = "select * from " + name + id + " "
    db.query(sq, function (err, result) {
      req.session.count = result.length
      if (err)
        throw err
    })
  }
  let qr = "select * from new_table"
  db.query(qr, function (err, result) {
    if (err)
      throw err
    let count = req.session.count
    if (count) {
      res.render('user', { data: result, user, count })
    } else {

      res.render('user', { data: result, user })
    }

  })
})

router.get('/admin', function (req, res) {
  let user = req.session.user
  let sql = "select * from new_table"
  db.query(sql, function (err, result) {
    if (err) throw err

    res.render('admin', { data: result, user })
  })
})
router.get('/add', function (req, res) {
  res.render('additem')

})

router.post('/submit', function (req, res) {
  let sq = "insert into new_table(mobile_name,model,price,image)value('" + req.body.name + "','" + req.body.model + "','" + req.body.price + "','" + req.body.image + "')"
  db.query(sq, function (err, result) {
    console.log(result)
    if (err)
      throw err
    res.redirect('/admin')
    let id = result.insertId
    let Image = req.files.image
    Image.mv("D:/faris/project/Abc/public/images/" + id + ".jpg")

  })
})

router.get('/edit/:id', function (req, res) {
  let userid = req.params.id
  let sq = `select * from new_table where id = ${userid}`
  db.query(sq, function (err, result) {
    if (err)
      throw err
    res.render('edit', { data: result[0] })
  })
})

router.post('/update', function (req, res) {
  let userid = req.body.id
  let sq = "update new_table set mobile_name='" + req.body.name + "',model='" + req.body.model + "', price='" + req.body.price + "' where id= '" + userid + "'"
  db.query(sq, function (err, result) {
    if (err)
      throw err
    res.redirect('/admin')
  })
})
router.get('/delete/:id', function (req, res) {
  let userid = req.params.id
  let sq = "delete from new_table where id ='" + userid + "'"
  db.query(sq, function (err,) {
    if (err)
      throw err
    res.redirect('/admin')

  })
})
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.render('user')
  } else {
    res.render('login', { data: req.session.logerr })
    req.session.logerr = false
  }
})
router.get('/signup', function (req, res) {
  res.render('signup')
})
router.post('/signup', function (req, res) {
  let name = req.body.username
  let id = req.body.id
  let sq = "insert into users(username,password,repeate_password)value('" + req.body.username + "','" + req.body.psw + "','" + req.body.pswrepeat + "')"

  db.query(sq, function (err, result) {
    if (err)
      throw err

    else if (result) {
      let sq = "select * from users where username= '" + name + "'"
      db.query(sq, function (err, data) {
        if (err)
          throw err
        let id = data[0].id
        if (data) {
          let sq = "create table " + name + id + " (id int auto_increment primary key ,mobile_name varchar(500),model varchar(500),price varchar(500),image varchar(500) )"
          db.query(sq, function (err, result) {
            if (err)
              throw err
            console.log('table created')
          })
        }
      })
    }
    res.render('login')
  })
})
router.post('/log', function (req, res) {
  let user = req.body.uname
  let pass = req.body.psw
  if (user && pass) {
    let sq = "select * from users where username=? and password=? "
    db.query(sq, [user, pass], function (err, result) {
      if (err)
        throw err
      if (result.length > 0) {

        req.session.loggedIn = true
        req.session.user = result[0]
        res.redirect('user')

      } else {
        req.session.logerr = true
        res.redirect('/login')
      }
    })
  }
})
router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('login')
})

router.get('/cart', function (req, res) {
  let user = req.session.user
  if (user == undefined) {
    res.redirect('/login')
  } else {
    let name = user.username
    let id = user.id
    let sq = "select * from " + name + id + " "
    db.query(sq, function (err, result) {
      if (err)
        throw err
      if (result) {
        let sql = "select sum(price) from " + name + id + " "
        db.query(sql, function (err, results) {
          if (err) throw err
          let value = results[0]
          let total = value['sum(price)']
          res.render('cart', { data: result, user, total })
          console.log(total);

        })

      }
    })

  }

})

router.get('/addtocart/:id', function (req, res) {
  let Id = req.params.id
  let user = req.session.user
  if (user) {
    let cartname = user.username
    let cartid = user.id
    let sq = "select * from new_table where id =" + Id + " "
    db.query(sq, function (err, result) {
      if (err)
        throw err
      let data = result[0]
      let sql = "insert into " + cartname + cartid + " (mobile_name,model,price,image)value('" + data.mobile_name + "','" + data.model + "','" + data.price + "','" + Id + "') "
      // insert product personal carts
      db.query(sql, function (err, results) {
        if (err)
          throw err

        res.redirect('/user')
      })
    })
  } else {
    res.redirect('/login')
  }

})
router.get('/remove/:id', function (req, res) {
  let id = req.params.id
  let user = req.session.user
  let name = user.username
  let Id = user.id
  let sq = "delete from " + name + Id + " where id = " + id + " "
  db.query(sq, function (err) {
    if (err)
      throw err
    res.redirect('/cart')
  })
})
router.get('/orders', function (req, res) {
  if (req.session.user) {
    let user = req.session.user
    let name = user.username
    let id = user.id
    let qr = "select * from profile"
    // /collect profile detiles/
    db.query(qr, function (err, resultz) {
      if (err)
        throw err
      let qry = "select * from " + name + id + " "
      // show product in orders page
      db.query(qry, function (err, results) {
        if (err) throw err
        let sql = "select sum(price) from " + name + id + " "
        // show total price in orders page
        db.query(sql, function (err, result) {
          if (err) throw err
          let value = result[0]
          let total = value['sum(price)']
          let qri = "select * from " + name + id + " "
          // show items count in orders page
          db.query(qri, function (err, rezult) {

            req.session.count = rezult.length
            let count = req.session.count
            res.render('orders', { user, data: resultz[0], res: results, total, count })
          })
        })

      })
    })
  }
})

router.post('/saveprofile', function (req, res) {
  let qr = "insert into profile(Name,Mobile_number,Address,postcode,state,Email_id)value('" + req.body.name + "','" + req.body.mobile + "','" + req.body.address + "','" + req.body.postcode + "','" + req.body.state + "','" + req.body.email + "')"
  db.query(qr, function (err, result) {
    if (err)
      throw err
    res.redirect('/user')
  })
})
router.get('/editprofile', function (req, res) {
  let user = req.session.user
  let qr = "select * from profile"
  db.query(qr, function (err, result) {
    if (err)
      throw err
    res.render('editprofile', { user, data: result[0] })
  })
})
router.get('/myprofile', function (req, res) {
  let user = req.session.user
  let qr = "select * from profile"
  db.query(qr, function (err, results) {
    if (err)
      throw err
    res.render('myprofile', { data: results[0], user })
  })
})
router.post('/updateprofile', function (req, res) {
  let qr = "update profile set Name='" + req.body.name + "',Mobile_number='" + req.body.mobile + "',Address='" + req.body.address + "',postcode='" + req.body.postcode + "',state='" + req.body.state + "',Email_id='" + req.body.email + "' where id='" + req.body.id + "' "
  db.query(qr, function (err, result) {
    res.redirect('/user')
  })
})
router.get('/payment', function (req, res) {
  res.render('payment')
})
router.get('/message', function (req, res) {
  let user = req.session.user
  res.render('message', { user })
})

router.get('/about', function (req, res) {
  let user = req.session.user
  res.render('about', { user })

})


module.exports = router;
