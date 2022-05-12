const server = require('../server');
const request = require('supertest');
const expect = require('chai').expect;

describe('The express server', function () {
    
    var app;
    
    before(function(done) {
           
        app = server.listen(3000, function (err) {
            if (err) { return done(err); }
            done();
        });
    });

    it('should render pug for the root path', function (done) {
        
        request(server)
            .get('/')
            .expect('Content-Type', /html/)
            .expect(200, function(err, res) {
                if (err) { return done(err); }
            
                done();
            });
    });

    after(function(done) {
        app.close(function() {
            done();
        });
    })
    
    // behavior
    it('should not respond to PUT requests for the root path', function (done) {
        
        request(server)
            .put('/')
            .expect(404, function(err, res) {
                if (err) { return done(err); }
            
                done();
            });
    });

    after(function(done) {
        app.close(function() {
            done();
        });
    })
    
    
    // post
    it('should respond to valid POST requests for the root path, with a redirect', function (done) {
        
        request(server)
            .post('/')
            /*.send({
                "first_name": "test",
                "last_name": "test"
            })*/
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