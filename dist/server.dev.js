"use strict";

var express = require('express');

var app = express();

var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;
var router = express.Router();

var path = require('path');

var pg = require('pg');

var bcrypt = require('bcrypt');

var _require = require('express-validator'),
    body = _require.body,
    validationResult = _require.validationResult; //Set location for accessing files


app.use(express["static"](path.join(__dirname, 'public'))); //Set the view engine for the express app  

app.set("view engine", "pug");
var current_username = "";
var current_realtorID = 2;
var addressID;
var realtor = true; //for parsing application/json

app.use(bodyParser.json());
app.use(express.json()); //for parsing application/xwww-

app.use(bodyParser.urlencoded({
  extended: true
})); //form-urlencoded

var Pool = require('pg').Pool;

var connectionParams = null;

if (process.env.DATABASE_URL != null) {
  connectionParams = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  connectionParams = {
    host: 'willowrealestate.postgres.database.azure.com',
    user: 'team5',
    password: 'Willow5!',
    database: 'postgres',
    port: 5432,
    ssl: true
  };
}

console.log(connectionParams);
var pool = new pg.Client(connectionParams);
pool.connect(function (err) {
  if (err) throw err;
});
router.get('/', function (req, res) {
  res.render('index', {
    title: 'Willow'
  });
});
router.post('/', function (req, res) {
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send({
      errors: errors.array()
    });
  }

  res.redirect('/');
});
router.get('/insert', function (req, res) {
  pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID", function (err, property_results) {
    console.log(err, property_results);
    res.render('insert', {
      properties: property_results.rows
    });
  });
});
router.post('/insert', function (req, res) {
  if (req.body.action && req.body.action == 'add') {
    var addAddress = "INSERT INTO address (street, city, state, zip) VALUES ( '".concat(req.body.street, "', '").concat(req.body.city, "', '").concat(req.body.state, "', '").concat(req.body.zip, "' ) ON conflict do nothing RETURNING  addressID");
    pool.query(addAddress, function (err, result) {
      if (!result) {
        return;
      }

      addressID = result.rows[0].addressid;
      console.log(err, result);
      var insertProperty = "INSERT INTO property (propertyType, price, size, num_bedroom, num_bathroom,realtorID, addressID) VALUES ('".concat(req.body.propertytype, "', '").concat(req.body.price, "','").concat(req.body.size, "','").concat(req.body.num_bedroom, "','").concat(req.body.num_bathroom, "','").concat(current_realtorID, "', '").concat(addressID, "')");
      pool.query(insertProperty, function (err, result) {
        console.log(err, result);
        res.redirect('/insert');
      });
    });
    var insertProperty = "INSERT INTO property (propertyType, price, size, num_bedroom, num_bathroom,realtorID, addressID) VALUES ('".concat(req.body.propertytype, "', '").concat(req.body.price, "','").concat(req.body.size, "','").concat(req.body.num_bedroom, "','").concat(req.body.num_bathroom, "','").concat(current_realtorID, "', '").concat(addressID, "')");
    pool.query(insertProperty, function (err, result) {
      console.log(err, result);
      res.redirect('/insert');
    });
  }

  if (req.body.action && req.body.action == 'update') {
    var updateAddress = "UPDATE address SET street = '".concat(req.body.street, "', city = '").concat(req.body.city, "', state = '").concat(req.body.state, "', zip = '").concat(req.body.zip, "' RETURNING addressID");
    pool.query(updateAddress, function (err, result) {
      if (result.rows.length == 0) {
        return;
      } else {
        addressID = result.rows[0].addressid;
        var updateProperty = "UPDATE property SET propertyType = '".concat(req.body.propertytype, "', price = '").concat(req.body.price, "', size='").concat(req.body.size, "', num_bedroom = '").concat(req.body.num_bedroom, "', num_bathroom = '").concat(req.body.num_bathroom, "' WHERE addressID = '").concat(addressID, "'");
        pool.query(updateProperty, function (err, result) {
          console.log(err, result);
          res.redirect('/insert');
        });
      }
    });
  }

  if (req.body.action && req.body.action == 'delete') {
    pool.query("DELETE FROM property WHERE addressID = '".concat(addressID, "'"), function (err, result) {
      console.log(err, result);
      res.redirect('/insert');
    });
  }
});
router.get('/register', function (req, res) {
  res.render('register');
});
router.post('/register', function (req, res) {
  if (req.body.action && req.body.action == 'customer') {
    realtor = false;
    res.redirect('/customersignup');
  }

  if (req.body.action && req.body.action == 'realtor') {
    realtor = true;
    res.redirect('/realtorsignup');
  }
});
router.get('/customersignup', function (req, res) {
  res.render('customersignup');
});
router.post('/customersignup', function _callee(req, res) {
  var hp;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(!req.body.username || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.phoneno || !req.body.email)) {
            _context.next = 4;
            break;
          }

          res.redirect('/customersignuperror');
          _context.next = 8;
          break;

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, 10));

        case 6:
          hp = _context.sent;
          pool.query("INSERT INTO customer(user_name,password,first_name,last_name,phone_number,email)\n\t\tVALUES ( '".concat(req.body.username, "', '").concat(hp, "', '").concat(req.body.firstName, "', '").concat(req.body.lastName, "', '").concat(req.body.phoneno, "', '").concat(req.body.email, "' ) "), function (err, result) {
            current_username = req.body.username;
            res.redirect('/customerlogin');
          });

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/customersignuperror', function (req, res) {
  res.render('customersignuperror');
});
router.post('/customersignuperror', function (req, res) {
  if (req.body.action && req.body.action == 'try again') {
    res.redirect('/customersignup');
  }
});
router.get('/realtorsignup', function (req, res) {
  res.render('realtorsignup');
});
router.post('/realtorsignup', function _callee2(req, res) {
  var hp;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(!req.body.realtorID || !req.body.username || !req.body.password || !req.body.agency || !req.body.firstName || !req.body.lastName || !req.body.phoneno || !req.body.email)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", res.redirect('/realtorsignuperror'));

        case 2:
          _context2.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, 10));

        case 4:
          hp = _context2.sent;
          pool.query("INSERT INTO realtor(realtorID, user_name,password, agency, first_name,last_name,phone_number,email)\n\t\tVALUES ( '".concat(req.body.realtorID, "' ,'").concat(req.body.username, "', '").concat(hp, "', '").concat(req.body.agency, "','").concat(req.body.firstName, "', '").concat(req.body.lastName, "', '").concat(req.body.phoneno, "', '").concat(req.body.email, "' ) \n\t "), function (err, result) {
            current_realtorID = req.body.realtorID;
            current_username = req.body.username;
            res.redirect('/realtorlogin');
          });

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.get('/realtorsignuperror', function (req, res) {
  res.render('realtorsignuperror');
});
router.post('/realtorsignuperror', function (req, res) {
  if (req.body.action && req.body.action == 'try again') {
    res.redirect('/realtorsignup');
  }
});
router.get('/invalid', function (req, res) {
  res.render('invalidlogin');
});
router.post('/invalid', function (req, res) {
  if (realtor) {
    res.redirect('/realtorlogin');
  } else {
    res.redirect('/customerlogin');
  }
});
router.get('/login', function (req, res) {
  res.render('index');
});
router.post('/login', function (req, res) {
  if (req.body.action && req.body.action == 'customer') {
    res.redirect('/customerlogin');
  }

  if (req.body.action && req.body.action == 'realtor') {
    res.redirect('/realtorlogin');
  }
});
router.get('/customerlogin', function (req, res) {
  res.render('customerlogin');
});
router.post('/customerlogin', function (req, res) {
  realtor = false; //check user name and password with db

  if (req.body.action && req.body.action == 'login') {
    current_username = req.body.username;
    pool.query("SELECT * FROM CUSTOMER WHERE user_name = '".concat(req.body.username, "'"), function (err, result) {
      console.log(err, result);

      if (result.rows.length == 0) {
        res.redirect('/nocustomer');
      }

      if (result.rows.length > 0) {
        var password = result.rows[0].password;

        if (bcrypt.compareSync(req.body.password, password)) {
          res.redirect('/customerpanel');
        } else {
          res.redirect('/invalid');
          console.log(req);
        }
      }
    });
  }

  if (req.body.action && req.body.action == 'register') {
    res.redirect('/register');
  }
});
router.get('/nocustomer', function (req, res) {
  res.render('nocustomer');
});
router.post('/nocustomer', function (req, res) {
  if (req.body.action && req.body.action == 'try again') res.redirect('/customerlogin');
  if (req.body.action && req.body.action == 'register') res.redirect('/customersignup');
});
router.get('/norealtor', function (req, res) {
  res.render('norealtor');
});
router.post('/norealtor', function (req, res) {
  if (req.body.action && req.body.action == 'try again') res.redirect('/realtorlogin');
  if (req.body.action && req.body.action == 'register') res.redirect('/realtorsignup');
});
router.get('/realtorlogin', function (req, res) {
  res.render('realtorlogin');
});
router.post('/realtorlogin', function (req, res) {
  realtor = true; //check user name and password with db

  if (req.body.action && req.body.action == 'login') {
    current_username = req.body.username;
    pool.query("SELECT * FROM realtor WHERE user_name = '".concat(req.body.username, "'"), function (err, result) {
      console.log(err, result);
      if (result.rows.length == 0) res.redirect('/norealtor');

      if (result.rows.length > 0) {
        var password = result.rows[0].password;

        if (bcrypt.compareSync(req.body.password, password)) {
          current_realtorID = result.rows[0].realtorID;
          res.redirect('/realtorpanel');
        } else {
          res.redirect('/invalid');
          console.log(req);
        }
      }
    });
  }

  if (req.body.action && req.body.action == 'register') {
    res.redirect('/register');
  }
});
router.get('/realtorpanel', function (req, res) {
  pool.query("SELECT * FROM realtor WHERE user_name = '".concat(current_username, "'"), function (err, realtor_results) {
    console.log(err, realtor_results);
    res.render('realtorpanel', {
      name: current_username,
      realtor: realtor_results.rows[0]
    });
  });
});
router.post('/realtorpanel', function (req, res) {
  if (req.body.action && req.body.action == 'crud') {
    res.redirect('/insert');
  }

  if (req.body.action && req.body.action == 'change password') {
    res.redirect('/realtorchangepassword');
  }

  if (req.body.action && req.body.action == 'change password') {
    res.redirect('/realtorchangephoneno');
  }

  if (req.body.action && req.body.action == 'change email') {
    res.redirect('/realtorchangeemail');
  }

  if (req.body.action && req.body.action == 'change agency') {
    res.redirect('/realtorchangeagency');
  }

  if (req.body.action && req.body.action == 'change phone number') {
    res.redirect('/realtorchangephoneno');
  }

  if (req.body.action && req.body.action == 'go to listings') {
    res.redirect('/listingsr');
  }
});
router.get('/listingsr', function (req, res) {
  pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE realtorID = '".concat(current_realtorID, "' "), function (err, property_results) {
    console.log(err, property_results);
    res.render('listingsr', {
      properties: property_results.rows
    });
  });
});
router.post('/listingsr', function (req, res) {
  if (req.body.action && req.body.action == 'Order by Housing Type') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY propertytype", function (err, results) {
      res.render('listingsr', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Order by Price') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY price", function (err, results) {
      res.render('listingsr', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Order by Number of Bedrooms') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY num_bedroom", function (err, results) {
      res.render('listingsr', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Order by Number of Bathrooms') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY num_bathroom", function (err, results) {
      res.render('listingsr', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Order by Zip Code') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY zip", function (err, results) {
      res.render('listingsr', {
        properties: results.rows
      });
    });
  }
});
router.get('/realtorchangeagency', function (req, res) {
  res.render('realtorchangeagency');
});
router.post('/realtorchangeagency', function (req, res) {
  pool.query("UPDATE realtor SET agency = '".concat(req.body.agency, "' WHERE user_name = '").concat(current_username, "' "));
  res.redirect('/realtorpanel');
});
router.get('/realtorchangepassword', function (req, res) {
  res.render('realtorchangepassword');
});
router.post('/realtorchangepassword', function (req, res) {
  pool.query("UPDATE realtor SET password = '".concat(req.body.password, "' WHERE user_name = '").concat(current_username, "' "));
  res.redirect('/realtorpanel');
});
router.get('/realtorchangeemail', function (req, res) {
  res.render('realtorchangeemail');
});
router.post('/realtorchangeemail', function (req, res) {
  pool.query("UPDATE realtor SET email = '".concat(req.body.email, "' WHERE user_name = '").concat(current_username, "' "));
  res.redirect('/realtorpanel');
});
router.get('/realtorchangephoneno', function (req, res) {
  res.render('realtorchangephoneno');
});
router.post('/realtorchangephoneno', function (req, res) {
  pool.query("UPDATE realtor SET phone_number = '".concat(req.body.phoneno, "' WHERE user_name = '").concat(current_username, "' "));
  res.redirect('/realtorpanel');
});
router.get('/customerpanel', function (req, res) {
  pool.query("SELECT * FROM customer WHERE user_name = '".concat(current_username, "'"), function (err, customer_results) {
    console.log(err, customer_results);
    res.render('customerpanel', {
      name: current_username,
      customer: customer_results.rows[0]
    });
  });
});
router.post('/customerpanel', function (req, res) {
  if (req.body.action && req.body.action == 'change password') {
    res.redirect('/customerchangepassword');
  }

  if (req.body.action && req.body.action == 'change password') {
    res.redirect('/customerchangephoneno');
  }

  if (req.body.action && req.body.action == 'change email') {
    res.redirect('/customerchangeemail');
  }

  if (req.body.action && req.body.action == 'change phone number') {
    res.redirect('/customerchangephoneno');
  }

  if (req.body.action && req.body.action == 'go to listings') {
    res.redirect('/listingsc');
  }
});
router.get('/listingsc', function (req, res) {
  pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID", function (err, property_results) {
    console.log(err, property_results);
    res.render('listingsc', {
      properties: property_results.rows
    });
  });
});
router.post('/listingsc', function (req, res) {
  if (req.body.action && req.body.action == 'Order by Housing Type') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY propertytype", function (err, results) {
      res.render('listingsc', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Order by Price') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY price", function (err, results) {
      res.render('listingsc', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Order by Number of Bedrooms') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY num_bedroom", function (err, results) {
      res.render('listingsc', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Order by Number of Bathrooms') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY num_bathroom", function (err, results) {
      res.render('listingsc', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Order by Zip Code') {
    pool.query("SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY zip", function (err, results) {
      res.render('listingsc', {
        properties: results.rows
      });
    });
  } else if (req.body.action && req.body.action == 'Contact Us') {
    res.redirect('/contactus');
  }
});
router.get('/contactus', function (req, res) {
  res.render('contactus');
});
router.post('/contactus', function (req, res) {
  if (req.body.action && req.body.action == 'done') {
    res.redirect('messagesent');
  }
});
router.get('/messagesent', function (req, res) {
  res.render('messagesent');
});
router.post('/messagesent', function (req, res) {
  if (req.body.action && req.body.action == 'Go back to listings') {
    res.redirect('/listingsc');
  }
});
router.get('/customerchangepassword', function (req, res) {
  res.render('customerchangepassword');
});
router.post('/customerchangepassword', function (req, res) {
  pool.query("UPDATE customer SET password = '".concat(req.body.password, "' WHERE user_name = '").concat(current_username, "' "));
  res.redirect('/customerpanel');
});
router.get('/customerchangeemail', function (req, res) {
  res.render('customerchangeemail');
});
router.post('/customerchangeemail', function (req, res) {
  pool.query("UPDATE customer SET email = '".concat(req.body.email, "' WHERE user_name = '").concat(current_username, "' "));
  res.redirect('/customerpanel');
});
router.get('/customerchangephoneno', function (req, res) {
  res.render('customerchangephoneno');
});
router.post('/customerchangephoneno', function (req, res) {
  pool.query("UPDATE customer SET phone_number = '".concat(req.body.phoneno, "' WHERE user_name = '").concat(current_username, "' "));
  res.redirect('/customerpanel');
});
app.use('/', router);
module.exports = app;
//# sourceMappingURL=server.dev.js.map
