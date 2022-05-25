const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000
const router = express.Router();
const path = require('path') 
const pg = require('pg')
const bcrypt = require('bcrypt') 
const { body, validationResult } = require('express-validator');  

//Set location for accessing files
app.use(express.static(path.join(__dirname, 'public')));

//Set the view engine for the express app  
app.set("view engine", "pug")
var current_username = "";
var current_realtorID = 2;
var addressID 
var realtor = true;
var customer_favorites = "";

//for parsing application/json
app.use(bodyParser.json());
app.use(express.json())

//for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended:true }));
//form-urlencoded

const Pool = require('pg').Pool

var connectionParams =  null;
if (process.env.DATABASE_URL != null){
    connectionParams = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    } 
}

   else{
   connectionParams = {
		user: 'team3_user',
		host: 'localhost',
		database: 'team3',
		password: 'team3pass',
		port: 5432 
	}
}



console.log(connectionParams)
const pool = new pg.Client(connectionParams)

pool.connect(err => {
    if (err) throw err; 
});
 
router.get('/', (req, res) => {
  res.render('index', { title: 'Willow' });
})

	
 
router.post('/',
		(req,res) => {
		
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(400).send({ errors: errors.array() });
		}
		
		res.redirect('/')

})

router.get('/insert', (req,res) => {  
	 
	pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID` , (err,property_results) => {
            console.log(err, property_results)
          res.render('insert', {  
		      properties: property_results.rows
			}); 
			
	
	}); 
})  

router.post('/insert',   (req, res) => {  
	if(req.body.action && req.body.action == 'add'){
		var addAddress = `INSERT INTO address (street, city, state, zip) VALUES ( '${req.body.street}', '${req.body.city}', '${req.body.state}', '${req.body.zip}' )  RETURNING  addressID` 
	
		pool.query(addAddress, (err,result) => {
			if( !result ) { return }
			    addressID = result.rows[0].addressid 
				console.log(err,result)
				
				var insertProperty = `INSERT INTO property (propertyType, price, size, num_bedroom, num_bathroom,realtorID, addressID) VALUES ('${req.body.propertytype}', '${req.body.price}','${req.body.size}','${req.body.num_bedroom}','${req.body.num_bathroom}','${current_realtorID}', '${addressID}')`
			
					pool.query(insertProperty, (err, result) => {
						console.log(err, addressID) 
						res.redirect('/insert') 
					})  
			})  
	}
		  
	if(req.body.action && req.body.action == 'update'){ 
	
	var updateAddress = `UPDATE address SET street = '${req.body.street}', city = '${req.body.city}', state = '${req.body.state}', zip = '${req.body.zip}' RETURNING addressID`
	
	pool.query(updateAddress , (err,result) => {
		if(!result){
			return
		}else{
			addressID = result.rows[0].addressid 
			
			var updateProperty = `UPDATE property SET propertyType = '${req.body.propertytype}', price = '${req.body.price}', size='${req.body.size}', num_bedroom = '${req.body.num_bedroom}', num_bathroom = '${req.body.num_bathroom}' WHERE addressID = '${addressID}'`
	
			pool.query( updateProperty , (err,result) => {
			console.log(err, result)

			res.redirect('/insert')
				
			})
		}
	})

	
	
}

	if(req.body.action && req.body.action == 'delete'){ 
		var deleteAddress = `DELETE FROM address WHERE street = '${req.body.street}', city = '${req.body.city}', state = '${req.body.state}', zip = '${req.body.zip}' RETURNING addressID`
		
		pool.query(deleteAddress , (err,result) => {
		if(!result){
			return
		}else{
			addressID = result.rows[0].addressid 
			
			var deletePropert = `DELETE FROM property WHERE addressID = '${addressID}'`
	
			pool.query( deleteProperty , (err,result) => {
			console.log(err, result)

			res.redirect('/insert')
				
			})
		}
	}) 
	}
}) 

router.get('/register', (req,res) => { 
	res.render('register')
}) 

router.post('/register', (req,res) => {
	if(req.body.action && req.body.action == 'customer'){
		realtor = false;
		res.redirect('/customersignup') 
		
	}
	if(req.body.action && req.body.action == 'realtor'){
		realtor = true;
		res.redirect('/realtorsignup')
	}
})


router.get('/customersignup',  (req,res) => {
	res.render('customersignup')

})

router.post('/customersignup' ,   async (req,res) => {
	
	
	if( !req.body.username || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.phoneno || !req.body.email){
		
		res.redirect('/customersignuperror')
	}else{
	 
	  const hp = await bcrypt.hash(req.body.password, 10)   
	 
	 pool.query(`INSERT INTO customer(user_name,password,first_name,last_name,phone_number,email)
		VALUES ( '${req.body.username}', '${hp}', '${req.body.firstName}', '${req.body.lastName}', '${req.body.phoneno}', '${req.body.email}' ) `, (err, result) => {
		 current_username = req.body.username; 
		 
		 res.redirect('/customerlogin')
		 
		 } );  
		
	}
	
})

router.get('/customersignuperror' , (req,res) => {
	res.render('customersignuperror')
	
})

router.post('/customersignuperror', (req,res) => {
	if( req.body.action && req.body.action == 'try again' ){ 
		  res.redirect('/customersignup')
	} 
})
	

router.get('/realtorsignup', (req,res) => {
	res.render('realtorsignup')
	
})

router.post('/realtorsignup', async (req,res) => {
	if( !req.body.realtorID || !req.body.username || !req.body.password || !req.body.agency || !req.body.firstName ||
	 !req.body.lastName || !req.body.phoneno || !req.body.email)  
	 
	 return res.redirect('/realtorsignuperror')
	
	const hp = await bcrypt.hash(req.body.password, 10)
	
	pool.query(`INSERT INTO realtor(realtorID, user_name,password, agency, first_name,last_name,phone_number,email)
		VALUES ( '${req.body.realtorID}' ,'${req.body.username}', '${hp}', '${req.body.agency}','${req.body.firstName}', '${req.body.lastName}', '${req.body.phoneno}', '${req.body.email}' ) 
	 `, (err, result) => {
		 current_realtorID = req.body.realtorID;
		 current_username = req.body.username;
		res.redirect('/realtorlogin')
		
		} ); 
	
	
})

router.get('/realtorsignuperror' , (req,res) => { 
	 res.render('realtorsignuperror')
}) 

router.post('/realtorsignuperror' , (req,res) => {
	if( req.body.action && req.body.action == 'try again' ){ 
		  res.redirect('/realtorsignup')
	} 
	
})

router.get('/favorites' , (req,res) => {
	res.render('favorites')
})

router.post('/favorites' , (req,res) => {
	
	
}) 

router.get('/invalid', (req,res) => {
	res.render('invalidlogin')
	
})

router.post('/invalid', (req,res) => { 
	if(realtor){
		res.redirect('/realtorlogin')
	}else{
		res.redirect('/customerlogin')
	}
	
})
 
router.get('/login' , (req,res) => {
	res.render('index')
	
})

router.post('/login' , (req,res) => {
	if(req.body.action && req.body.action == 'customer') {
		res.redirect('/customerlogin')
	}	
	if(req.body.action && req.body.action == 'realtor') {
		res.redirect('/realtorlogin')
	}	
	 
})


router.get('/customerlogin', (req,res) => {
	res.render('customerlogin')
	
})



router.post('/customerlogin',    (req,res) => { 
 
realtor = false
//check user name and password with db
	if(req.body.action && req.body.action == 'login'){
 		current_username = req.body.username;
			 pool.query(`SELECT * FROM CUSTOMER WHERE user_name = '${req.body.username}'`, (err,result) => {
				console.log(err,result) 
				
				if(result.rows.length == 0) {
					res.redirect('/nocustomer') 
				}
				if(result.rows.length > 0){
					var password = result.rows[0].password
					
					if(  bcrypt.compareSync(req.body.password, password) ){
						res.redirect('/customerpanel')
					}else{
						
						res.redirect('/invalid') 
						console.log(req)
				}
			}
				}); 
			}
	 
		 
	
	if(req.body.action && req.body.action == 'register'){
		res.redirect('/register');
	}
	
 })

router.get('/nocustomer' , (req,res) => {
	res.render('nocustomer')
})

router.post('/nocustomer' , (req,res) => {
	if(req.body.action && req.body.action == 'try again')
		res.redirect('/customerlogin')
	if(req.body.action && req.body.action == 'register')
		res.redirect('/customersignup')
	
	
})

router.get('/norealtor' , (req,res) => {
	res.render('norealtor')
})

router.post('/norealtor' , (req,res) => {
	if(req.body.action && req.body.action == 'try again')
		res.redirect('/realtorlogin')
	if(req.body.action && req.body.action == 'register')
		res.redirect('/realtorsignup')
	
	
})

router.get('/realtorlogin', (req,res) => {
	res.render('realtorlogin')
	
})


router.post('/realtorlogin', (req,res) => { 

realtor = true

//check user name and password with db
	if(req.body.action && req.body.action == 'login'){
		   
			current_username = req.body.username
			 pool.query(`SELECT * FROM realtor WHERE user_name = '${req.body.username}'`, (err,result) => {
				console.log(err,result)
				
				if(result.rows.length == 0)
					res.redirect('/norealtor') 
				
				if(result.rows.length > 0){
					var password = result.rows[0].password
					
					if( bcrypt.compareSync(req.body.password, password) ){
						current_realtorID = result.rows[0].realtorID
						res.redirect('/realtorpanel')
					}else{
						 res.redirect('/invalid') 
						 console.log(req)
					}
				}
				
			})
				
	}
	 
		 
	
	if(req.body.action && req.body.action == 'register'){
		res.redirect('/register');
	}
	
 })


 
router.get('/realtorpanel', (req,res) => {
	
	pool.query(`SELECT * FROM realtor WHERE user_name = '${current_username}'`, (err,realtor_results) => {
            console.log(err, realtor_results)
			current_realtorID = realtor_results.rows[0].realtorid
         
             res.render('realtorpanel', { 
                     name: current_username,
                      realtor: realtor_results.rows[0] 
			});
	});   
	 
 })
 
 router.post('/realtorpanel', (req,res) => {
	 
		if(req.body.action && req.body.action == 'crud'){
			res.redirect('/insert')
		}
		
		if(req.body.action && req.body.action == 'change password'){
			res.redirect('/realtorchangepassword')
				
		}   
		
		if(req.body.action && req.body.action == 'change password'){
			res.redirect('/realtorchangephoneno')
				
		} 
		
		
		
		if(req.body.action && req.body.action == 'change email'){
			res.redirect('/realtorchangeemail')
				
		} 
		
			
		if(req.body.action && req.body.action == 'change agency'){
			res.redirect('/realtorchangeagency')
				
		} 
		
		if(req.body.action && req.body.action == 'change phone number'){
			res.redirect('/realtorchangephoneno')
		}		
				
		if(req.body.action && req.body.action == 'go to listings'){
			res.redirect('/listingsr')
		}  
		
	 
 })
 
 
router.get('/listingsr', (req,res) => {
	pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE realtorid = '${current_realtorID}' ` , (err,property_results) => {
 
            console.log(err, property_results)
          res.render('listingsr', {  
		      properties: property_results.rows
			}); 
			
	
	});
 })

router.post('/listingsr', (req,res) => {
	if(req.body.action && req.body.action == 'Order by Housing Type') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE realtorid = '${current_realtorID}' ORDER BY propertytype` , (err,results) =>  {
			res.render('listingsr', {  
		      properties: results.rows
			}); 
		})
	}else if(req.body.action && req.body.action == 'Order by Price') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE realtorid = '${current_realtorID}' ORDER BY price`, (err,results) =>  {
			res.render('listingsr', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Number of Bedrooms') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE realtorid = '${current_realtorID}' ORDER BY num_bedroom`, (err,results) =>  {
			res.render('listingsr', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Number of Bathrooms') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE realtorid = '${current_realtorID}' ORDER BY num_bathroom`, (err,results) =>  {
			res.render('listingsr', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Zip Code') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE realtorid = '${current_realtorID}' ORDER BY zip`, (err,results) =>  {
			res.render('listingsr', {  
		      properties: results.rows
			}); 
		})
	}else if(req.body.action && req.body.action == 'Contact Us'){
		res.redirect('/contactus')
	}
})  



router.get('/realtorchangeagency', (req,res) => {
	res.render('realtorchangeagency')

})

router.post('/realtorchangeagency' , (req,res) => {
	pool.query(`UPDATE realtor SET agency = '${req.body.agency}' WHERE user_name = '${current_username}' `  )
	res.redirect('/realtorpanel')
	 
})

router.get('/realtorchangepassword' , (req,res) => {
	res.render('realtorchangepassword')
})

router.post('/realtorchangepassword', (req,res) => {
	pool.query(`UPDATE realtor SET password = '${req.body.password}' WHERE user_name = '${current_username}' `  )
	res.redirect('/realtorpanel')
	
})


router.get('/realtorchangeemail', (req,res) => {
	res.render('realtorchangeemail')

})

router.post('/realtorchangeemail' , (req,res) => {
	pool.query(`UPDATE realtor SET email = '${req.body.email}' WHERE user_name = '${current_username}' `  )
	res.redirect('/realtorpanel')
	 
})

router.get('/realtorchangephoneno' , (req,res) => {
	res.render('realtorchangephoneno')
})

router.post('/realtorchangephoneno', (req,res) => {
	pool.query(`UPDATE realtor SET phone_number = '${req.body.phoneno}' WHERE user_name = '${current_username}' `  )
	res.redirect('/realtorpanel')
	
})



router.get('/customerpanel', (req,res) => { 
	
	pool.query(`SELECT * FROM customer WHERE user_name = '${current_username}'`, (err,customer_results) => {
            console.log(err, customer_results)
         
            res.render('customerpanel', { 
                     name: current_username,
                      customer: customer_results.rows[0] 
			});
			
	
	}); 
			 
	 
 })
 
 router.post('/customerpanel', (req,res) => {
	  
	if(req.body.action && req.body.action == 'change password'){
		res.redirect('/customerchangepassword')
			
	}   
	
	if(req.body.action && req.body.action == 'change password'){
		res.redirect('/customerchangephoneno')
			
	} 
	
	
	
	if(req.body.action && req.body.action == 'change email'){
		res.redirect('/customerchangeemail')
			
	} 
	 
	
	if(req.body.action && req.body.action == 'change phone number'){
		res.redirect('/customerchangephoneno')
			
	} 
	
	if(req.body.action && req.body.action == 'go to listings') {
		res.redirect('/listingsc')
	}
	 
 }) 
 
 router.get('/listingsc', (req,res) => { 
	if (req.query.addressid != undefined) {
		pool.query(`SELECT * FROM customer WHERE user_name = '${current_username}'`, (err,results) =>  {
			var addaddress;
			if (results.rows[0].favorites == null) {
				addaddress = req.query.addressid
			} else {
				addaddress = results.rows[0].favorites + "," + req.query.addressid
			}
			//console.log(results.rows[0].favorites, addaddress)
			//console.log("added "+req.query.addressid+" to " + addaddress)
			pool.query(`UPDATE customer SET favorites = '${addaddress}' WHERE user_name = '${current_username}'`)
			res.redirect('/listingsc')
	})
	} else {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID` , (err,property_results) => {
            console.log(customer_favorites)
          res.render('listingsc', {  
		      properties: property_results.rows
		  })
		})
	}	
});

router.post('/listingsc', (req,res) => {
	if(req.body.action && req.body.action == 'Order by Housing Type') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY propertytype` , (err,results) =>  {
			res.render('listingsc', {  
		      properties: results.rows
			}); 
		})
	}else if(req.body.action && req.body.action == 'Order by Price') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY price`, (err,results) =>  {
			res.render('listingsc', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Number of Bedrooms') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY num_bedroom`, (err,results) =>  {
			res.render('listingsc', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Number of Bathrooms') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY num_bathroom`, (err,results) =>  {
			res.render('listingsc', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Zip Code') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID ORDER BY zip`, (err,results) =>  {
			res.render('listingsc', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'My Favorites') {
		 res.redirect('/favorites')
	}else if(req.body.action && req.body.action == 'Contact Us') {
		 res.redirect('/contactus')
	 }
})

router.get('/favorites', (req,res) => {
	pool.query(`SELECT * FROM customer WHERE user_name = '${current_username}'`, (err,results) =>  {
		customer_favorites = (results.rows[0].favorites) ? results.rows[0].favorites : ""
		console.log(customer_favorites)
		if (req.query.addressid != undefined) {

			var favorites;
			var deleteaddress;
			if ((results.rows[0].favorites).slice(0,((String) (req.query.addressid)).length - 1) == req.query.addressid) {
				deleteaddress = req.query.addressid
			} else {
				deleteaddress = "," + req.query.addressid
			}
			console.log(results.rows[0].favorites, deleteaddress)
			favorites = (results.rows[0].favorites).replace(deleteaddress,'')
			console.log("deleted something from " + favorites)
			customer_favorites = favorites
			pool.query(`UPDATE customer SET favorites = '${favorites}' WHERE user_name = '${current_username}'`)
			res.redirect('/favorites')
		} else {
			//console.log("displaying favorites")
			var favorites;
			if (!(results.rows) || results.rows.length == 0 || results.rows[0].favorites == null) {
				res.redirect('/nofavorites')
			}
			else {
				favorites = ("('" + results.rows[0].favorites + "')").replaceAll(",","','")
				//console.log(favorites)
				pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE propertyid IN ${favorites}`, (err, results) =>{
					//console.log(results.rows)
					res.render('favorites', {  
						properties : results.rows
				 	 });
				})
			}
		}

	})
})

router.post('/favorites', (req,res) => {
	favorites = ("('" + customer_favorites + "')").replaceAll(",","','")
	if(req.body.action && req.body.action == 'Order by Housing Type') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE propertyid IN ${favorites} ORDER BY propertytype` , (err,results) =>  {
			console.log(results)
			res.render('favorites', {  
		      properties: results.rows
			}); 
		})
	}else if(req.body.action && req.body.action == 'Order by Price') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE propertyid IN ${favorites} ORDER BY price`, (err,results) =>  {
			res.render('favorites', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Number of Bedrooms') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE propertyid IN ${favorites} ORDER BY num_bedroom`, (err,results) =>  {
			res.render('favorites', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Number of Bathrooms') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE propertyid IN ${favorites} ORDER BY num_bathroom`, (err,results) =>  {
			res.render('favorites', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Order by Zip Code') {
		pool.query(`SELECT * FROM property INNER JOIN address on address.addressID = property.addressID WHERE propertyid IN ${favorites} ORDER BY zip`, (err,results) =>  {
			res.render('favorites', {  
		      properties: results.rows
			}); 
		}) 
	}else if(req.body.action && req.body.action == 'Back to Listings') {
		 res.redirect('/listingsc')
	}else if(req.body.action && req.body.action == 'Contact Us') {
		res.redirect('/contactus') 
	}else if(req.body.action && req.body.action == 'Contact Realtor' ){
		res.redirect('/autofill')
	
	} 
	
	
})

router.get('/favorites' , (req,res) => {
	pool.query(`SELECT * FROM customer` , (err,property_results) => {
            console.log(err, property_results) 
			res.render('favorites', {  
		      properties: property_results.rows
			});   
	});   
}) 

router.get('/contactus' , (req,res) => {
	res.render('contactus')
})

router.post('/contactus' , (req,res) => {
	if(req.body.action && req.body.action == 'done' ){
		res.redirect('/messagesent')
	}
	
})

router.get('/autofill' , (req,res) => {
	res.render('autofill')
})

router.post('/autofill' , (req,res) => {
	if(req.body.action && req.body.action == 'done' ){
		res.redirect('/autofillmessagesent')
	}
	
})
 

router.get('/messagesent' , (req,res) => {
	res.render('messagesent')
	
})

router.post('/messagesent' , (req,res) => {
	if(req.body.action && req.body.action == 'Go back to listings' ) {
		res.redirect('/listingsc')
	}
	
}) 


router.get('/autofillmessagesent' , (req,res) => {
	res.render('autofillmessagesent')
	
})

router.post('/autofillmessagesent' , (req,res) => {
	if(req.body.action && req.body.action == 'Go back to listings' ) {
		res.redirect('/listingsc')
	}
	
}) 

router.get('/nofavorites' , (req,res) => {
	res.render('nofavorites')
})

router.post('/nofavorites' , (req,res) => {
	if(req.body.action && req.body.action == 'Listings')
		res.redirect('/listingsc')
})

router.get('/customerchangepassword' , (req,res) => {
	res.render('customerchangepassword')
})

router.post('/customerchangepassword', (req,res) => {
	pool.query(`UPDATE customer SET password = '${req.body.password}' WHERE user_name = '${current_username}' `  )
	res.redirect('/customerpanel')
	
})


router.get('/customerchangeemail', (req,res) => {
	res.render('customerchangeemail')

})

router.post('/customerchangeemail' , (req,res) => {
	pool.query(`UPDATE customer SET email = '${req.body.email}' WHERE user_name = '${current_username}' `  )
	res.redirect('/customerpanel')
	 
})

router.get('/customerchangephoneno' , (req,res) => {
	res.render('customerchangephoneno')
})

router.post('/customerchangephoneno', (req,res) => {
	pool.query(`UPDATE customer SET phone_number = '${req.body.phoneno}' WHERE user_name = '${current_username}' `  )
	res.redirect('/customerpanel')
	
})

app.use('/',router);
module.exports = app
