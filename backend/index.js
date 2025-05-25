const app=require('./app');
require('./firebase');
app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
  });