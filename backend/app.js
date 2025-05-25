const express=require('express');
const morgan=require('morgan');
const app=express()
const {db}=require('./firebase')
app.use(morgan('dev'));
app.get('/',async (req,res)=>{
   const querySnapshot=await  db.collection('pagos').get()
   console.log(querySnapshot.docs[0].data())
    res.send('hello')
})
module.exports=app;