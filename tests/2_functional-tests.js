const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
   
   suite('POST /api/threads/{board} => newThread', function() {
         let board ='fashionsite';
         test('Create a new thread', function(done) {
            chai.request(server)
            .post('/api/threads/'+board)
            .send({text:'FashionNova is the best', delete_password:"shop"})
            .end(function(err, res){
                 chai.request(server)
                 .get('/api/threads/'+board)
                 .query()
                 .end(function(err,res){
                   let found = false;
                   for(let i=0; i<res.body.length;i++){
                     if (res.body[i]["text"]==="FashionNova is the best"){
                       found =true;
                     }
                   }
                    assert.equal(found, true);
                 })
            
                done();
            })
       })
     
   
   })  
   suite('GET /api/threads/{board} => thread', function() {
         let board ="High Paying Jobs";
         test('Get 10 most recent threads with 3 replies each', function(done) {
            chai.request(server)
            .get('/api/threads/High Paying Jobs')
            .query()
            .end(function(err, res){
                 assert.isAtMost(res.body.length, 10);
                 assert.property(res.body[0], "_id");
                 assert.property(res.body[0], "text");
                 assert.property(res.body[0], "created_on");
                 assert.property(res.body[0], "replies");
                done();
            })
       })
    })  
  
   suite('DELETE /api/threads/{board} => thread', function() {
         let board ='fashionsite';
         test('Deleting a thread with the incorrect password', function(done) {
           chai.request(server)
             .post('/api/threads/'+board)
             .send({text:'FashionNova is the best', delete_password:"shop"})
             .end(function(err, res){
                 chai.request(server)
                 .get('/api/threads/'+board)
                 .query()
                 .end(function(err,res){
                   let id;
                   for(let i=0; i<res.body.length;i++){
                     if (res.body[i]["text"]==="FashionNova is the best"){
                       id =res.body[i]["_id"];
                       break;
                     }
                   }
                  chai.request(server)
                 .delete('/api/threads/'+board)
                 .send({thread_id:id,delete_password:"wrong"})
                 .end(function(err,res){
                    assert.equal(res.text, "incorrect password");
                 })
                 })
            
                done();
            })
       })
       
      test('Deleting a thread with the incorrect password', function(done) {
            chai.request(server)
             .post('/api/threads/'+board)
             .send({text:'FashionNova is the best', delete_password:"shop"})
             .end(function(err, res){
                 chai.request(server)
                 .get('/api/threads/'+board)
                 .query()
                 .end(function(err,res){
                   let id;
                   for(let i=0; i<res.body.length;i++){
                     if (res.body[i]["text"]==="FashionNova is the best"){
                       id =res.body[i]["_id"];
                       break;
                     }
                   }
                  chai.request(server)
                 .delete('/api/threads/'+board)
                 .send({thread_id:id,delete_password:"shop"})
                 .end(function(err,res){
                    assert.equal(res.text, "success");
                 })
                 })
            
                done();
            })
       }) 
    }) 
  
     suite('PUT /api/threads/{board} => thread', function() {
         let board ='fashionsite';
         test('Report a thread', function(done) {
            chai.request(server)
            .put('/api/threads/'+board)
            .send({thread_id:'6102396fbbaf833cce87c7f0'})
            .end(function(err, res){
                  assert.equal(res.text, "success");        
                done();
            })
       })
      
   }) 
  
 
  suite('POST /api/replies/{board} => reply', function() {
         let board ='fashionsite';
          let threadid = "6102396fbbaf833cce87c7f0"
         test('Create a new reply', function(done) {
            chai.request(server)
            .post('/api/replies/'+board)
            .send({thread_id:threadid,text:"Zara is the best", delete_password:"shop"})
            .end(function(err, res){
                 chai.request(server)
                 .get('/api/replies/'+board)
                 .query({threadid:threadid})
                 .end(function(err,res){
                   let found = false;
                   for(let i=0; i<res.body[0]["replies"].length;i++){
                     if (res.body[0]["replies"][i]["text"]==="Zara is the best"){
                       found =true;
                     }
                   }
                    assert.equal(found, true);
                 })
            
                done();
            })
       })
     
   
   })  
  
  
  
  
 suite('GET /api/replies/{board} => replies', function() {
         let board ="High Paying Jobs";
         let threadid = "6102396fbbaf833cce87c7f0"
         test('Get a single thread with all replies', function(done) {
            chai.request(server)
                 .get('/api/replies/'+board)
                 .query({threadid:threadid})
                 .end(function(err,res){
                  assert.property(res.body[0], "_id");
                  assert.property(res.body[0], "text");
                  assert.property(res.body[0], "created_on");
                  assert.property(res.body[0], "replies");
                 })
            
                done();
            })
       })
  
  
    suite('DELETE /api/replies/{board} => reply', function() {
         let board ='fashionsite';
         let threadid = "6102396fbbaf833cce87c7f0"
         let replyid = "61025c0de545b9755bfeacca"
         let wrongpassword = "juice"
         let rightpassword = "shop"
         
         test('Deleting a reply with the incorrect password', function(done) {
           chai.request(server)
           .delete('/api/replies/'+board)
           .send({reply_id:replyid, thread_id:threadid,delete_password:wrongpassword})
            .end(function(err, res){
                 assert.equal(res.text, "incorrect password");
            })
                done();
            })
            
            
         test('Deleting a reply with the correct password', function(done) {
           chai.request(server)
           .delete('/api/replies/'+board)
           .send({reply_id:replyid, thread_id:threadid,delete_password:rightpassword})
            .end(function(err, res){
                 assert.equal(res.text, "success");
            })
                done();
            })
       })
       
     
       suite('PUT /api/replies/{board} => replies', function() {
         let board ='fashionsite';
         let threadid = "6102396fbbaf833cce87c7f0"
         let replyid = "61025c0de545b9755bfeacca"
         
         test('Report a reply', function(done) {
            chai.request(server)
            .put('/api/replies/'+board)
            .send({reply_id:replyid,thread_id:threadid})
            .end(function(err, res){
                  assert.equal(res.text, "success");        
                done();
            })
       })
      
   }) 
     
     
});





  /*suite('POST /api/replies/{board} => reply', function() {
         let board ='fashionsite';
         let threadid = "6102396fbbaf833cce87c7f0"
         test('Post reply', function(done) {
            chai.request(server)
            .post('/api/replies/'+board)
            .send({thread_id:'threadid',text:"bought a shirt"})
            .end(function(err, res){
                  expect(res).to.redirectTo("https://anonymous-message-board-ann.glitch.me/b/"+board+"/"+threadid+"/");    
                done();
            })
       })
      
   })  */