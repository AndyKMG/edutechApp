// const express = require('express');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Définissez le dossier de destination pour stocker les fichiers temporaires

// const app = express();

// app.post('/uploadPDF', upload.single('pdf'), async (req, res) => {

//   try {
//     const file = req.file; // Fichier PDF envoyé
//     const fileName = file.originalname; // Nom du fichier PDF
//     //console.log(fileName)
//     // Téléversement du fichier PDF vers le stockage Firebase
//     await uploadPDFToFirebase(file.path, fileName);
//     res.status(200).send({ message: 'Fichier PDF téléversé avec succès.' });
//   } catch (error) {
//     console.error("Une erreur s'est produite :", error);
//     res.status(500).send({ message: 'Erreur serveur' });
//   }
// });

// // Fonction pour téléverser le fichier PDF vers le stockage Firebase
// async function uploadPDFToFirebase(filePath, fileName) {
//   // Code pour téléverser le fichier vers le stockage Firebase
// }

// // Démarrer le serveur
// const PORT = 3030;
// app.listen(PORT, () => {
//   console.log(`Serveur démarré sur le port ${PORT}`);
// });

const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyZGF0YSI6e30sImRvY0Rvd25sb2FkIjpbeyJ0eXBlRG9jIjoiRXByZXV2ZXMiLCJOb21Eb2MiOiJSZXVzc2lyX0VudHJldGllbnMucGRmIn0seyJ0eXBlRG9jIjoiTGl2cmVzIiwiTm9tRG9jIjoiUmV1c3Npcl9FbnRyZXRpZW5zLnBkZiJ9LHsidHlwZURvYyI6IkxpdnJlcyIsIk5vbURvYyI6IlJldXNzaXJfRW50cmV0aWVucy5wZGYifV0sIlBhbmllciI6W3sidHlwZURvYyI6IkxpdnJlcyIsIk5vbURvYyI6IlJldXNzaXJfRW50cmV0aWVucy5wZGYiLCJwcml4IjoiMTAwMCJ9XSwiQXNraW5nUHJvZmlsIjpbXSwiaWF0IjoxNzA5ODM2MTgxLCJpc3MiOiJhdXRoU2VydmVyIiwic3ViIjoidHBEcml2aW5nIiwianRpIjoidW5pcXVlVG9rZW5JZCJ9.4RdCAfqbmMJEF9fBpfG0OSrOxXZAOaUWgKXsY4XL6Bo"
// const decodedToken = jwt.decode(token, { complete: true });
    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));

console.log(decodedToken)