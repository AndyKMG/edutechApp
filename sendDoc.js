const admin = require('firebase-admin');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
// const serviceAccount = require('./my-edutheque-data-firebase-adminsdk-t14gz-b43be089a5.json'); // Chemin vers votre clé de compte de service Firebase

// // Initialisation de Firebase Admin SDK avec les informations d'identification du service
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: 'gs://my-edutheque-data.appspot.com' // Remplacez "votre-bucket" par le nom de votre bucket Firebase Storage
// });

// Obtention d'une référence au service de stockage Firebase
const bucket = admin.storage().bucket();


// Fonction pour insérer un fichier PDF dans Firebase Storage
// Téléversement d'un document
async function uploadPDF(filePath, fileName, destinationPath) {
    try {
        // Téléchargement du fichier PDF
        await bucket.upload(filePath, {
            destination: destinationPath + "/" + fileName,
            metadata: {
                contentType: 'application/pdf' // Spécifiez le type MIME du fichier PDF
            }
        });
        console.log('Fichier PDF inséré avec succès dans Firebase Storage.');
        return true
    } catch (error) {
        console.error('Erreur lors de l\'insertion du fichier PDF :', error);
        return false
    }
}

// Fonction de nettoyage du timestamp 
// du serveur local
// Ici je ne fais que supprimer
// Le fichier temporaire du document
async function deletePDF(filePath) {
    try {
        // Supprimer le fichier temporaire après le téléversement réussi
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier temporaire :', err);
                // Gérer l'erreur ici
            } else {
                console.log('Fichier temporaire supprimé avec succès');
                // Répondre à la demande ou effectuer d'autres actions nécessaires
            }
        });

    } catch (error) {
        console.error('Erreur lors de la suppression du fichier PDF :', error)
    }
}

// Fonction de téléchargement d'un Document
async function downloadPDF(fileName, destinationPath) {
    try {
        // Chemin local où enregistrer le Document téléchargé
        const localFilePath = `./doc/downloads/${fileName}`;
        // Chemin en ligne du Document dans le bucket Firebase Storage
        const remoteFilePath = `${destinationPath}/${fileName}`;
        
        // Téléchargement du Document depuis Firebase Storage vers un chemin local
        await bucket.file(remoteFilePath).download({ destination: localFilePath });
        
        console.log(`Fichier ${fileName} téléchargé avec succès dans ${localFilePath}.`);
        
        // Lecture du Document
        const data = fs.readFileSync(localFilePath, 'utf8');
        //console.log('Contenu du fichier :', data);
         
        return data;
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error);
        return false;
    }
}

module.exports = { uploadPDF, downloadPDF, deletePDF }