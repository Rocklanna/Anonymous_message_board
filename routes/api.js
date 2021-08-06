'use strict';

const mongoose = require("mongoose");

mongoose.connect(process.env.DB,{useNewUrlParser:true, useUnifiedTopology:true})

const thread = new mongoose.Schema({
  _id:{type:mongoose.ObjectId,required:true},
  board:{type:String,required:true},
  replies:[{type:mongoose.ObjectId}]
})

const messages = new mongoose.Schema({
  threadid:{type:mongoose.ObjectId},
  board:{type:String,required:true},  
  text:{type:String,required:true},
  created_on:{type:Date,required:true},
  bumped_on:{type:Date},
  reported:{type:Boolean,required:true},
  delete_password:{type:String,required:true}
})

const orgThread = new mongoose.model("orgThread",thread);
const allMessages = new mongoose.model("allMessages",messages);


module.exports = function (app) {
  
  app.route('/api/threads/:board')
  
   .put(function(req,res){
    try{
    let orgboard = (req.params.board=="" || req.params.board==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.params.board;
    
    let threadid = (req.body.thread_id=="" || req.body.thread_id==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.thread_id;
    
     allMessages.findOneAndUpdate({board:orgboard,threadid:threadid},{reported:true}).then(updated=>{     
        if(!updated){
           res.send("Incorrect board or threadid entered");
       }
       else if(updated){
                 res.send("success")
       }
     })
    }
    catch(err){
      console.error(err);
    }
  })
  
 
  .post(function(req,res){
    
     
      let orgboard = (req.params.board=="" || req.params.board==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.params.board;
    
       let text = (req.body.text=="" || req.body.text==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.text;
    
       let delete_password = (req.body.delete_password=="" || req.body.delete_password==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.delete_password;
    
       let timeElapsed = Date.now();
       let time_stamp = new Date(timeElapsed);
       let replies = [];
    
      
       
       try{
              
       const msgtoDB = new allMessages({board:orgboard,text:text,created_on:time_stamp,bumped_on:time_stamp,reported:false,delete_password:delete_password});    
       
         msgtoDB.save().then(saveddata=>{
           
            const thread = new orgThread({_id:saveddata["_id"],board:orgboard,replies:replies});
           
           thread.save().then(savedthread=>{
               allMessages.findOneAndUpdate({_id:saveddata["_id"]},{threadid:saveddata["_id"]},function(err,updated){
                 res.redirect(`/b/${orgboard}/`); 
               })  
           })
         })
       
       }
        catch(err){
         console.error(err);
       } 
  
  
  })
  
   .get( function(req,res){
     
    let orgboard = req.params.board;
    try{
      
    allMessages.find({$expr:{$eq:["$_id","$threadid"]},board:orgboard},{reported:0,delete_password:0,__v:0}).sort({bumped_on:'desc'}).limit(10).lean().then(async function(foundData){
                      
                 Promise.all(foundData.map(async function(found){
                        
                      let replied = await orgThread.find({_id:found["threadid"]},{replycount:{$size:"$replies"},replies:{$slice:-3}}).lean()
                      found["replycount"]=replied[0]["replycount"];
                                            
                      return await Promise.all(replied[0]["replies"].map(async function(replyId){
      
                      let replyData = await allMessages.findOne({_id:replyId},{_id:1,text:1,created_on:1})
                      return replyData
      
                      })             
                      ).then(fullreply=> {
                             found["replies"]=fullreply;
                              return found;
                      }) 
                  })).then(result=>{
                                   res.json(result)
                     })
                    })

 }// end try
    catch(err){
      console.error(err);
    }// end catch
   
  })
  
  
  
  .delete(function(req,res){
    
    let orgboard = (req.params.board=="" || req.params.board==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.params.board;
    
    let threadid = (req.body.thread_id=="" || req.body.thread_id==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.thread_id;
    
    let delete_password = (req.body.delete_password=="" || req.body.delete_password==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.delete_password;
    
    try{
      
       allMessages.findOne({_id:mongoose.Types.ObjectId(threadid),board:orgboard}).then(foundData=>{
      
         console.log(foundData);
     if(!foundData){
           res.send("Incorrect board or threadid entered");
      }
      
      else if(foundData["delete_password"]!=delete_password){
           res.send("incorrect password");
      }
      else if(foundData["delete_password"]===delete_password){
        orgThread.deleteOne({_id:threadid,board:orgboard}).then(deleted=>{
          if(deleted["deletedCount"]==1){
            allMessages.deleteMany({threadid:threadid,board:orgboard}).then(deleteInfo=>{
              if(deleteInfo["ok"]==1){
                 res.send("success")
              }
            })
          }
          
        })
      }
    })
    }
    catch(err){
      console.error(err);
    }
  })
  
  app.route('/api/replies/:board')

   .post(function(req,res){
     
   let orgboard = (req.params.board=="" || req.params.board==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.params.board;
    
    let threadid = (req.body.thread_id=="" || req.body.thread_id==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.thread_id;
    
    let text = (req.body.text=="" || req.body.text==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.text;
    
    let delete_password = (req.body.delete_password=="" || req.body.delete_password==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.delete_password;
    
    let timeElapsed = Date.now();
    let time_stamp = new Date(timeElapsed);
    
    orgThread.find({_id:mongoose.Types.ObjectId(threadid)}).then(founddata=>{
      
      if(!founddata){
        res.send("There is no thread with id "+ threadid);
      }
      
      else if(founddata){
      
      let replies = [];
      const msgtoDB = new allMessages({threadid:founddata[0]["_id"], board:orgboard,text:text,created_on:time_stamp,reported:false,delete_password:delete_password});  
        
       msgtoDB.save().then(saveddata=>{
        replies.push(saveddata["_id"]);  
        orgThread.findOneAndUpdate({_id:threadid},{$push:{replies:replies}},function(err,updated){
        if(err){
            console.log("Error occured, please try again");
        }  
          
        else if(updated){
          allMessages.findOneAndUpdate({_id:threadid},{bumped_on:time_stamp},function(err,updated){
             if(err){
            console.log("Error occured, please try again");
            }  
            else if(updated){
               res.redirect(`/b/${orgboard}/${threadid}/`); 
            }
          
          })
        }  
        })
                
       })
      }
      
    })
   })
  
    .get( function(req,res){
     
    let orgboard = req.params.board;
    
    let threadid = (req.query.thread_id=="" || req.query.thread_id==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.query.thread_id;
    
   try{  
     
    allMessages.find({threadid:threadid,$expr:{$eq:["$_id","$threadid"]},board:orgboard},{reported:0,delete_password:0,__v:0}).sort({bumped_on:'desc'}).lean().then(async function(foundData){
                      
                 Promise.all(foundData.map(async function(found){
                        
                      let replied = await orgThread.find({_id:found["threadid"]}).lean()
                                                               
                      return await Promise.all(replied[0]["replies"].map(async function(replyId){
      
                      let replyData = await allMessages.findOne({_id:replyId},{_id:1,text:1,created_on:1})
                      return replyData
      
                      })             
                      ).then(fullreply=> {
                             found["replies"]=fullreply;
                             return found;
                      }) 
                  })).then(result=>{
                                   res.json(result);
                     })
                    })

  }
    catch(err){
      console.error(err);
    }
   
  })
  
  .delete(function(req,res){
    
     let orgboard = (req.params.board=="" || req.params.board==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.params.board;
    
    let threadid = (req.body.thread_id=="" || req.body.thread_id==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.thread_id;
    
    let replyid = (req.body.reply_id=="" || req.body.reply_id==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.reply_id;
    
    let delete_password = (req.body.delete_password=="" || req.body.delete_password==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.delete_password;
    
    
    try{
       allMessages.findOne({_id:mongoose.Types.ObjectId(replyid),threadid:mongoose.Types.ObjectId(threadid),board:orgboard},function(err,founddata){
                      console.log(founddata);
     if(!founddata){
           res.send("Incorrect board or threadid entered");
      }
      
      else if(founddata["delete_password"]!=delete_password){
           res.send("incorrect password");
      }
      else if(founddata["delete_password"]===delete_password){
        allMessages.findOneAndUpdate({_id:mongoose.Types.ObjectId(replyid),threadid:mongoose.Types.ObjectId(threadid),board:orgboard},{text:"[deleted]"},function(err,updated){
            if(err){
            console.log("Error occured, please try again");
            }
            else{
                res.send("success")
            }
          
        })
      }
               }) 
      
      

    }
    catch(err){
      console.error(err);
    }
    
  })
  
  .put(function(req,res){
    try{
    let orgboard = (req.params.board=="" || req.params.board==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.params.board;
    
    let threadid = (req.body.thread_id=="" || req.body.thread_id==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.thread_id;
    
    let replyid = (req.body.reply_id=="" || req.body.reply_id==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.reply_id;
    
     allMessages.findOneAndUpdate({board:orgboard,_id:mongoose.Types.ObjectId(replyid),threadid:threadid},{reported:true}).then(updated=>{     
        if(!updated){
           res.send("Incorrect board or threadid entered");
       }
       else if(updated){
                 res.send("success")
       }
     })  
    }
    catch(err){
      console.error(err)
    }
  })
  
};
