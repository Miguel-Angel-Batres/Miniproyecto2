const express=require('express');
const morgan=require('morgan');
const app=express()
const cors = require('cors');
const {db}=require('./firebase')
app.use(morgan('dev'));
app.use(cors()); 
app.get('/',async (req,res)=>{
   const querySnapshot=await  db.collection('pagos').get()
   console.log(querySnapshot.docs[0].data())
    res.send('hello')
})


app.get('/deportes', async (req, res) => {
  try {
    const snapshot = await db.collection('deportes').get();
    const deportes = snapshot.docs.map(doc => doc.data());
    res.json(deportes);
  } catch (error) {
    console.error("Error al obtener deportes:", error);
    res.status(500).send("Error al obtener deportes");
  }
});
module.exports=app;