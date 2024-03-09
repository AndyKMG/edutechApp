const express = require('express');
const emailValidator = require('email-validator');
const mailer = require('express-mailer');
const app = express();
var isValid = false;
const ejs = require('ejs')
app.set('view engine', 'ejs');

mailer.extend(app, {
    views: {
        directory: './views',
        options: {
            extension: 'ejs' // Extension de fichier de modèle (par exemple, 'ejs')
        }
    }, 
    from: 'projetedutech@gmail.com',
    host: 'smtp.gmail.com',
    secureConnection: true, // Utilisez TLS pour sécuriser la connexion
    port: 465,
    transportMethod: 'SMTP',
    auth: {
        user: 'projetedutech@gmail.com',
        pass: 'xenq epas rxpo pary'
    }
});

async function sendEmail(email) {
    if (emailValidator.validate(email)) {
       await app.mailer.send('email', {
            to: email,
            subject: 'Inscription Edutech',
            //username: 'Nom d\'utilisateur'
        }, function (err) {
            if (err) {
                console.log(err);
                // Gérez l'erreur ici
                return { "success": false, "message": err.message };
            }
            console.log('E-mail envoyé avec succès')
            // Envoyez une réponse réussie ici
            return { "success": true, "message": 'E-mail envoyé avec succès' };
        });
    } else {
        console.log('Email is not valid');
        // Gérez l'erreur ici si l'e-mail n'est pas valide
        return { "success": false, "message": 'Email non valide' };
    }
}

module.exports = { sendEmail };
