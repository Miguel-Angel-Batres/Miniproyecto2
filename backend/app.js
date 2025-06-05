const express=require('express');
const morgan=require('morgan');
const cors = require('cors');
const path = require('path');
const nodemailer=require('nodemailer');
const app=express()
const {db,auth}=require('./firebase');
const { ConsoleLogger } = require('@angular/compiler-cli');
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
const angularDistPath = path.join(__dirname, '../dist/mini-ii/browser');
console.log('Ruta de Angular:', angularDistPath);

app.use(express.static(angularDistPath));
app.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    next();
});
app.get('/', (req, res) => {
    res.sendFile(path.join(angularDistPath, 'index.html'));
});
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:`maesito23763446@gmail.com`,
        pass:`dhqe gouj qnad uuzl`
    }
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
        const docRef = db.collection('registros_pendientes').doc(confirmationToken); 
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
        const docRef = db.collection('contraseñas_reseteadas').doc(resetToken);
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
        const resetRef = db.collection('contraseñas_reseteadas').doc(token);
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
        const pendingRef = db.collection('registros_pendientes').doc(token);
        const pendingSnap = await pendingRef.get(); 
        if (!pendingSnap.exists) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }
        const { email, password, extraData } = pendingSnap.data();
        const telefonoSanitizado = sanitizarNumeroMexicano(extraData.telefono);
        const userCredential = await auth.createUser({
            email,
            password,
            phoneNumber: telefonoSanitizado, 
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
app.put('/api/actualizar-contrasena', async (req, res) => {
    const { uid, contraseña } = req.body;
    try {
        console.log('Actualizando contraseña para UID:', uid);
        if (!uid || !contraseña) {
            return res.status(400).json({ message: 'UID y contraseña son requeridos' });
        }

        await auth.updateUser(uid, { password: contraseña });

        res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);

        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (error.code === 'auth/invalid-password') {
            return res.status(400).json({ message: 'La contraseña no cumple con los requisitos' });
        }

        res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
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
app.get('/api/usuarios/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const userDoc = await db.collection('usuarios').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({ uid: userDoc.id, ...userDoc.data() });
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
}
);
app.put('/api/usuarios/:uid', async (req, res) => {
    const { uid } = req.params;
    const updates = req.body;
    try {
        const userRef = db.collection('usuarios').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        await userRef.update(updates);

        const updatedUserSnap = await userRef.get();
        const updatedUser = updatedUserSnap.data();
    
        // Devuelve los datos actualizados
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
}
);
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

app.get('/api/planes', async (req, res) => {
    try {
        const snapshot = await db.collection('planes').get();
        const planes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(planes);
        console.log('Planes obtenidos:', planes);
    } catch (error) {
        console.error('Error al obtener los planes:', error);
        res.status(500).json({ message: 'Error al obtener los planes' });
    }
}
);
app.get('/api/planes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const planDoc = await db.collection('planes').doc(id).get();
        if (!planDoc.exists) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        res.status(200).json({ id: planDoc.id, ...planDoc.data() });
    } catch (error) {
        console.error('Error al obtener el plan:', error);
        res.status(500).json({ message: 'Error al obtener el plan' });
    }
} );
app.post('/api/planes', async (req, res) => {
    const { nombre, descripcion, precio, tipoPago } = req.body;
    try {
        const newPlanRef = await db.collection('planes').add({
            nombre,
            descripcion,
            precio,
            tipoPago
        });
        const newPlanDoc = await newPlanRef.get();
        const newPlanData = { id: newPlanDoc.id, ...newPlanDoc.data() };
        res.status(201).json({ newPlanData, message: 'Plan creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el plan:', error);
        res.status(500).json({ message: 'Error al crear el plan' });
    }
});
app.put('/api/planes/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const planRef = db.collection('planes').doc(id);
        const planDoc = await planRef.get();
        if (!planDoc.exists) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        await planRef.update(updates);
        res.status(200).json({ message: 'Plan actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el plan:', error);
        res.status(500).json({ message: 'Error al actualizar el plan' });
    }
}
);
app.get('/api/pagos'), async (req, res) => {
    try {
        const snapshot = await db.collection('pagos').get();
        const pagos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(pagos);
        console.log('Pagos obtenidos:', pagos);
    } catch (error) {
        console.error('Error al obtener los pagos:', error);
        res.status(500).json({ message: 'Error al obtener los pagos' });
    }
}
function sanitizarNumeroMexicano(numero) {
    if (!numero) return null;
    let limpio = numero.toString().replace(/[\s\-\(\)]/g, ''); // quita espacios, guiones, paréntesis
    limpio = limpio.replace(/^(\+?52)?(1|044|045|01)?/, ''); // quita prefijos
    if (/^\d{10}$/.test(limpio)) {
        return '+52' + limpio;
    }
    return null; // número inválido
}


module.exports=app;