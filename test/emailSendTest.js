// const nodemailer = require('nodemailer');

// // Configuration du transporteur
// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'projetedutech@gmail.com',
//         pass: 'xenq epas rxpo pary'
//     }
// });

// // projetedutech@gmail.com
// // koumagnonandy490@gmail.com
// // Options de l'e-mail
// let mailOptions = {
//     from: 'projetedutech@gmail.com',
//     to: 'koumagnonandy490@gmail.com ',
//     subject: 'Test d\'envoi d\'e-mail',
//     text: 'Ceci est un e-mail de test envoyé depuis Node.js.'
// };

// // Envoi de l'e-mail
// transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//         console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
//     } else {
//         console.log('E-mail envoyé :', info.response);
//     }
// });

const admin = require('firebase-admin');

const serviceAccount = require('../my-edutheque-data-firebase-adminsdk-t14gz-b43be089a5.json');

// Initialisation de Firebase Admin SDK avec les informations d'identification du service
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://my-edutheque-data.firebaseio.com", // URL de votre base de données Firestore
    storageBucket: 'gs://my-edutheque-data.appspot.com' // Remplacez "votre-bucket" par le nom de votre bucket Firebase Storage
  
  });
  const db = admin.firestore();

const Utilisateurs = db.collection('Utilisateurs')


const data = {
    name: 'John Doe',
    age: 30,
    hobbies: ['Reading', 'Gaming', 'Cooking']
};
async function test(){
// Ajouter des données à une collection dans Firebase Firestore
await Utilisateurs.doc('user1').set(data);
console.log("C'est deja fait")
}
test()