const app=require('./app');
require('./firebase');
app.listen(3000, () => {
    console.log('Servidor escuchando en https://gimnasio-santa-cruz-ww7d.onrender.com');
  });