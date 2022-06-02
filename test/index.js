const server = require('../server');
const request = require('supertest')
const expect = require('chai').expect;

describe('The express server', function() {
	var app;
	
	before(function(done) {
		app = server.listen(3000, function(err) {
			if(err) { return done(err); }
			done();
		});
	});
	
	it('should render html for the root path', function(done) {
		request(server)
			.get('/')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});
	
	it('should render html for the register path', function(done) {
		request(server)
			.get('/register')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});

	it('should render html for the customersignup path', function(done) {
		request(server)
			.get('/customersignup')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});

	it('should render html for the customersignuperror path', function(done) {
		request(server)
			.get('/customersignuperror')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});

	it('should render html for the realtorsignup path', function(done) {
		request(server)
			.get('/realtorsignup')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});

	it('should render html for the realtorsignuperror path', function(done) {
		request(server)
			.get('/realtorsignuperror')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});

	it('should render html for the invalid path', function(done) {
		request(server)
			.get('/invalid')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});

	it('should render html for the login path', function(done) {
		request(server)
			.get('/login')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});

	it('should render html for the customerlogin path', function(done) {
		request(server)
			.get('/customerlogin')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});

	it('should render html for the contactus path', function(done) {
		request(server)
			.get('/contactus')
			.expect('Content-Type',/html/)
			.expect(200,function(err,res) {
				if(err) { return done(err); }
				
				done();
			});
		});
		 
		 
	it('it should not respond to PUT requests for the root path',
	function(done) {
		request(server)
		.put('/')
		.expect(404, function(err,res) {
			if(err) { return done(err); }
			done();
			
		});
	});
	 
		
	it('should respond to valid POST requests for the root path, with a redirect',
		function(done) {
			request(server)
				.post('/') 
				.expect(302)
				.expect('Location', '/')
				.end(done);
		}); 
		
		
		 
		
		after(function(done) {
			
			app.close(function() {
				done();
			});
		})
	});
		
	

