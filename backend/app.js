const express=require('express');
const morgan=require('morgan');
const nodemailer=require('nodemailer');
const app=express()
const {db,auth}=require('./firebase');
app.use(morgan('dev'));
app.use(express.json());
app.get('/', async (req, res) => {
    try {
      const snapshot = await db.collection('pagos').get();
      const data = snapshot.docs.map(doc => doc.data());
      // obtener usuarios de auth
    const users = await auth.listUsers();
    
    // prueba, cambiar telefono de usuario en especifico y de su auth
    const user = users.users.find(user => user.email === 'maesito50@gmail.com');
    const user2 = users.users.find(user => user.email === 'prueba2@hotmail.com');
    const user3 = users.users.find(user => user.email === 'ariel@hotmail.com');
    
    if (user2) {
        await auth.updateUser(user2.uid, { phoneNumber: '+521222222222' });
        console.log(`Teléfono actualizado para el usuario ${user2.email}`);
    }
    if (user) {
        await auth.updateUser(user.uid, { phoneNumber: '+521111111111' });
        console.log(`Teléfono actualizado para el usuario ${user.email}`);
    }
    if (user3) {
        await auth.updateUser(user3.uid, { phoneNumber: '+521333333333' });
        console.log(`Teléfono actualizado para el usuario ${user3.email}`);
    }
    
      res.json({ pagos: data, usuarios: users.users });


    } catch (err) {
      console.error('Error al obtener pagos:', err);
      res.status(500).send('Error al obtener pagos');
    }
  });
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:`maesito23763446@gmail.com`,
        pass:`dhqe gouj qnad uuzl`
    }
})



app.post
app.post('/api/verificar-attemps', async (req, res) => {
    const { email } = req.body;
    try {
        // Obtener usuario de la colección de usuarios
        const usuarioSnapshot = await db.collection('usuarios').where('correo', '==', email).get();
        const usuarioData = usuarioSnapshot.docs.length > 0 ? usuarioSnapshot.docs[0].data() : null;
        if(usuarioData.Bloqueado){
            return res.status(403).json({ bloqueo: true, message: 'Cuenta bloqueada por múltiples intentos fallidos.' });
        }else{
        if(usuarioData.IntentosFallidos >= 2) {
            await db.collection('usuarios').doc(usuarioSnapshot.docs[0].id).update({
                Bloqueado: true
            });
            return res.status(403).json({ bloqueo: true,message: 'Cuenta bloqueada por múltiples intentos fallidos.' });
        }else{
            await db.collection('usuarios').doc(usuarioSnapshot.docs[0].id).update({
                IntentosFallidos: usuarioData.IntentosFallidos + 1
            });
            return res.status(200).json({ bloqueo: false, message: 'Usuario verificado correctamente.' });
        }
        }
        
        
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ bloqueo: false, message: 'El usuario no existe.' });
        }
        return res.status(500).json({ bloqueo: false, message: 'Error al verificar el usuario' });
    }
});
app.post('/api/registro', async (req, res) => {
    const { email, password, extraData } = req.body;
    try {
        const confirmationToken = Math.random().toString(36).substring(2, 15);
        const docRef = db.collection('pendingRegistrations').doc(confirmationToken); 
        await docRef.set({
            email,
            password,
            extraData,
            createdAt: new Date().toISOString(),
        });

        const confirmationLink = `http://localhost:3000/api/confirmacion?token=${confirmationToken}`;
        await transporter.sendMail({
            from: "Tu dios chinchillas",
            to: email,
            subject: 'Confirmación de Registro',
            text: `Al hacer click el siguiente enlace,recibiras la bendicion de nuestro dios todo poderoso chinchillas: ${confirmationLink}`,
        });

        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
});
app.post('/api/recuperar-cuenta', async (req, res) => {
    const { email } = req.body;
    try {
        console.log(email);
        if (!email) {
            return res.status(400).json({ ok: false, message: 'El correo electrónico es requerido' });
        }

        const user = await db.collection('usuarios').where('correo', '==', email).get();
        if (user.empty) {   
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        }
        
        const resetToken = Math.random().toString(36).substring(2, 15);
        const docRef = db.collection('passwordResets').doc(resetToken);
        await docRef.set({
            email,
            createdAt: new Date().toISOString(),
        });

        const resetLink = `http://localhost:3000/api/reset-password?token=${resetToken}`;
        const enviaremail = await transporter.sendMail({
            from: email, 
            to: "maesito23763446@gmail.com", 
            subject: 'Recuperación de Cuenta',
            text: `El usuario con correo ${email} solicitó restablecer su contraseña. Enlace de restablecimiento: ${resetLink}`,
        });
        if (!enviaremail) {
            return res.status(500).json({ ok: false, message: 'Error al enviar el correo de recuperación' });
        }else{
            return res.status(200).json({ ok: true, message: 'Correo de recuperación enviado' });
        }
    } catch (error) {
        console.error('Error al enviar correo de recuperación:', error);
        return res.status(500).json({ ok: false, message: 'Error al enviar correo de recuperación' });
    }
}
);
app.get('/api/reset-password', async (req, res) => {
    const { token } = req.query;
    try {
        const resetRef = db.collection('passwordResets').doc(token);
        const resetSnap = await resetRef.get();
        if (!resetSnap.exists) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }

        const { email } = resetSnap.data();
        const newPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).toUpperCase().substring(2, 3) + Math.floor(Math.random() * 10);

        try {
            const userSnapshot = await db.collection('usuarios').where('correo', '==', email).limit(1).get();
            if (userSnapshot.empty) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }
            const userId = userSnapshot.docs[0].id;
            
            await db.collection('usuarios').doc(userId).update({ 
                Bloqueado: false, 
                IntentosFallidos: 0 
            });

            await auth.updateUser(userId, { password: newPassword });

        } catch (err) {
            console.error('Error al actualizar la contraseña:', err);
            return res.status(500).json({ message: 'Error al restablecer la contraseña' });
        }

        await resetRef.delete();

        try {
            await transporter.sendMail({
                from: "Tu dios chinchillas",
                to: email,
                subject: 'Contraseña Restablecida',
                text: `Tu contraseña ha sido restablecida exitosamente. Tu nueva contraseña es: ${newPassword}`,
            });
        } catch (err) {
            console.error('Error al enviar el correo:', err);
            return res.status(500).json({ message: 'Error al enviar el correo de restablecimiento' });
        }

        res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
});
app.get('/api/confirmacion', async (req, res) => {
    const { token } = req.query;
    try {
        const pendingRef = db.collection('pendingRegistrations').doc(token);
        const pendingSnap = await pendingRef.get(); 
        if (!pendingSnap.exists) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }
        const { email, password, extraData } = pendingSnap.data();
        const userCredential = await auth.createUser({
            email,
            password,
            phoneNumber: extraData.telefono, // Guardar el teléfono de extraData
        });
        const user = userCredential;
        await db.collection('usuarios').doc(user.uid).set({
            ...extraData,
            uid: user.uid,
            correo: email,
            fechaRegistro: new Date().toISOString(),
        });
        await pendingRef.delete();

        res.status(200).json({ message: 'Registro confirmado exitosamente' });
    } catch (error) {
        console.error('Error al confirmar el registro:', error);
        res.status(500).json({ message: 'Error al confirmar el registro' });
    }
});
app.post('/api/verificar-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await auth.getUserByEmail(email);
        return res.status(400).json({ exists: true, message: 'El correo electrónico ya está registrado.' });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return res.status(200).json({ exists: false, message: 'El correo electrónico está disponible.' });
        }
        res.status(500).json({ message: 'Error al verificar el correo electrónico' });
    }
});
app.get('/api/usuarios', async (_, res) => {
    try {
        const querySnapshot = await db.collection('usuarios').get();
        const usuarios = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
});
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