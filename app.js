// Ce fichier est le point d'entrée de notre appliation
// Ici vous avez les package utilisé dans le fichier
// pour executer des taches données
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const upload = multer({ dest: "doc/uploads" });
const port = 3030;
const app = express();
const cors = require("cors");

const {
  addUser,
  addSimpleUser,
  addToken,
  checkUserData,
  recupToken,
  updateUser,
  updateToken,
  addBook,
  nomUserCheking,
  checkPDFExistance,
  sendProfilAsking,
  recupAllProfilsAsking,
  recupAllUploadAsking,
  activeParentControl,
  validDoc,
  validUpdate,
  totalCost,
  checkUserEmail,
  checkPDFExistanceByTheme,
} = require("./dbConnect");
const { sendEmail } = require("./emailConfig");
const {
  createToken,
  modifiedToken,
  extractTokenInfos,
  emptyTokenInfo,
} = require("./userToken");
const { uploadPDF, deletePDF, downloadPDF } = require("./sendDoc");
let errorMsg;

// prompt $g
// Middleware de parsing JSON
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());
app.use(bodyParser.json());
app.set("view engine", "ejs");

// API d'inscription simple
// Cette API d'inscription ne recupere que 3 informations
// Le Nom de l'Utilisateur
// Le Mot de passe du compte
// et l'Email de l'Utilisateur
app.use("/signIn", async (req, res) => {
  // Recuperation du corps de la requete
  // Et affichage pour test
  const data = req.body;
  console.log("Activation de silverSignIn");
  console.log(data);

  try {
    // Initialisation des variables
    const password = data["password"];
    const npi = data["npi"];
    const username = data["userName"];

    // Verifions si le nom de L'User existe deja dans notre base
    const nomUserCheked = await nomUserCheking(username);
    // Si il existe alors envoyé une erreur au frontend
    if (nomUserCheked) {
      console.log(
        "Erreur : Nom Utilisateur Existant, veuillez en choisir un autre svp"
      );
      errorMsg =
        "Erreur : Le nom d'Utilisateur " +
        nomUser +
        " existe, veuillez en choisir un autre svp";
      throw console.error();
    }
    // Sinon,
    else {
      // Insertion d'un Utilsiateur dans la base
      const { userId, user } = await addSimpleUser(username, npi, password);
      // console.log(user)

      // Creation du Token de l'utilisateur
      // Ce token contiendra toutes les informations
      // de notre utilisateur
      const token = await createToken(user);

      // Insertion du Token de l'utilisateur dans la Base
      // et recuperation de son id
      const tokenId = await addToken(token);

      // Mise a jour de l'Utilisateur
      // par Enregistrement de son tokenId
      const userUpdated = await updateUser(userId, tokenId);

      // Mise a jour du token de l'Utilisateur
      const tokenUpdated = await updateToken(tokenId, userUpdated);

      // Decodage du token pour l'envoi au frontend
      const decodedToken = JSON.parse(
        Buffer.from(tokenUpdated.split(".")[1], "base64").toString("utf-8")
      );

      // Envoie de la reponse de vlaidation de l'inscritpion au frontend
      res.status(200).send({
        message: "Inscription en Argent Validée !",
        userToken: decodedToken,
      });
    }
  } catch (error) {
    // Gestion des erreurs
    console.error("Une erreur s'est produite :", error);
    console.log(errorMsg);
    if (errorMsg != "") res.status(500).send({ message: errorMsg });
    else res.status(500).send({ message: "Erreur Serveur !" });
  }
});

// API d'inscription en Argent
// Cette API est plus complexe que la précedente
// Elle prend en compte un Utilisateur dans toute sa largesse
app.use("/silverSignIn", async (req, res) => {
  // Recuperation du corps de la requete
  // Et affichage test
  const data = req.body;
  console.log("Activation de silverSignIn");
  console.log(data);

  try {
    // Initialisation des variables de travail
    // Toutes obtenu dans la requete
    const userEmail = data["email"];
    const age = data["Age"];
    const niveauEtude = data["NiveauEtude"];
    const classAnnée = data["ClassAnnée"];
    const password = data["password"];
    const npi = data["NPI"];
    const userName = data["userName"];
    const sexe = data["Sexe"];
    const tel = data["Tel"];

    // Verifions si le nom de L'User existe deja dans la base
    const nomUserCheked = await nomUserCheking(userName);
    // Si oui, alors envoyé une erreur au frontend
    if (nomUserCheked) {
      console.log(
        "Erreur : Nom Utilisateur Existant, veuillez en choisir un autre svp"
      );
      errorMsg =
        "Erreur : Le nom d'Utilisateur " +
        userName +
        " existe, veuillez en choisir un autre svp";
      throw console.error();
    }
    // Sinon
    else {
      // Insertion d'un Utilsiateur dans la base
      const { userId, user } = await addUser(
        userEmail,
        age,
        niveauEtude,
        classAnnée,
        password,
        npi,
        userName,
        sexe,
        tel
      );

      //Affichage test
      // console.log(user)
      // Creation du Token de l'utilisateur
      const token = await createToken(user);

      // Insertion du Token de l'utilisateur et recuperation de son id
      const tokenId = await addToken(token);

      // Mise a jour de l'Utilisateur par Enregistrement de son tokenId
      const userUpdated = await updateUser(userId, tokenId);

      // Mise  a jour du token de l'Utilisateur
      const tokenUpdated = await updateToken(tokenId, userUpdated);

      // Decodage du token pour l'envoi au frontend
      const decodedToken = JSON.parse(
        Buffer.from(tokenUpdated.split(".")[1], "base64").toString("utf-8")
      );

      // Envoie de la reponse d'inscription validée au frontend
      res.status(200).send({
        message: "Inscription en Argent Validée !",
        userToken: decodedToken,
      });
    }
  } catch (error) {
    // Gestion des erreurs
    console.error("Une erreur s'est produite :", error);
    console.log(errorMsg);
    if (errorMsg != "") res.status(500).send({ message: errorMsg });
    else res.status(500).send({ message: "Erreur Serveur !" });
  }
});

// API d'inscription en Or
// Cette API permet a un Utilisateur de ne s'inscrire qu'avec son email
// Bien evidemment il faudra lui permettre de finaliser
// L'inscritpion plus tard
app.use("/goldenSignIn", async (req, res) => {
  // Recuperation du corps de la requete
  // Le corps ne contient que l'email de l'utilisateur
  // Et affichage pour test
  const data = req.body;
  console.log("Activation de goldenSignin");
  console.log(data);

  try {
    // Initialisation de la variable de base
    const userEmail = data["userEmail"];

    // Insertion de l'Utilisateur dans la base
    const user = await addUser(userEmail);

    // Creation du Token de l'utilisateur
    const token = await createToken(user);

    // Insertion du Token de l'utilisateur et recuperation de son id
    const tokenId = await addToken(token);

    // Misee a jour de l"Utilisateur par Enregistrement de son toekn tokenId
    const userUpdated = await updateUser(user.userId, tokenId);

    // Mise a jour du token de l'Utilisateur
    const tokenUpdated = await updateToken(tokenId, userUpdated);
    // Decodage du token pour l'envoi au User
    const decodedToken = JSON.parse(
      Buffer.from(tokenUpdated.split(".")[1], "base64").toString("utf-8")
    );

    // Ici Verifions si l'Utilisateur a bien été créé
    // Ensuite envoie de la response d'inscription validée au frontend
    if (user.userId != null) {
      const msg = await sendEmail(userEmail);
      res.status(200).send({ "message ": "Email envoyé avec succès" });
    }
  } catch (error) {
    // Gestion des erreurs
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de demande de téléversement d'un document
// Cette API permettra de demander la publication d'un document
// Le document sera donc enregistré dans une base tempon
// en attendant la validation par un Animateur
app.use("/askUploadPDF", upload.single("pdf"), async (req, res) => {
  try {
    // Recuperation du corps de la requete
    // et du fichier qu'il contient,
    // Le fichier est encodé en utf-8 et stocké
    // dans un sous dossier du serveur local
    const data = req.body;
    const file = req.file;
    console.log("Activation de UploadPDF");

    // Affichage test
    console.log(data);

    // Initialisation des variables de bases
    // Avec des valeurs par defaut
    // Cette demarche vient du fait que
    // Notre système gère (03) Trois different types de document
    // Les Epreuves
    // Les Livres
    // Les Mémoires
    // Chacun de ces documents possèdes des caractéristiques différents
    let annee = "",
      niveauEtude = "",
      classAnnee = "",
      chapterTab = [],
      tagTab = [],
      domainEtude = "",
      auteur = "",
      prix = "",
      ecole = "",
      ISBN = "",
      isFree = "";

    // Recuperation du nom original du fichier envoyé
    const fileName = file.originalname;
    // Recuperation des variables de bases
    // Obtenu dans la requete
    const destinationPath = data["destinationPath"];
    annee = data["annee"];
    niveauEtude = data["niveauEtude"];
    classAnnee = data["classAnnee"];
    chapterTab = data["chapterTab"];
    tagTab = data["tagTab"];
    domainEtude = data["domainEtude"];
    auteur = data["auteur"];
    prix = data["prix"];
    ecole = data["ecole"];
    ISBN = data["ISBN"];
    isFree = data["isFree"];

    //Affichage test
    console.log(fileName);
    console.log(destinationPath);

    // Verifions si le nom du Document existe deja
    const docCheked = await checkPDFExistance(fileName, destinationPath);
    //console.log(docCheked)

    // Si il n'existe pas déja alors
    if (docCheked != null || docCheked != " ") {
      // Téléversement du fichier PDF vers le stockage Firebase,, FireStore
      const uploaded = await uploadPDF(file.path, fileName, destinationPath);

      // Ajout des infos du PDF dans la table correspondante au niveau du firebase Database
      await addBook(
        destinationPath,
        fileName,
        domainEtude,
        annee,
        niveauEtude,
        classAnnee,
        chapterTab,
        tagTab,
        auteur,
        ISBN,
        prix,
        ecole,
        isFree
      );

      // Suppression du fichier temporaire creer par le serveur local afin de liberer de la place
      if (uploaded) await deletePDF(file.path);

      // Envoie de la reponse au frontend
      res.status(200).send({
        message:
          "Fichier PDF téléversé avec succès. En attente de la validation par un Administrateur",
      });
    }
    // Si Le document existe deja alors
    // Envoyé une erreur au frontend
    else {
      console.log(
        "Erreur : Le Document " +
          fileName +
          " existe, veuillez en choisir un autre svp."
      );
      errorMsg =
        "Erreur : Le Document " +
        fileName +
        " existe, veuillez en choisir un autre svp.";
      throw error;
    }
  } catch (error) {
    // gestion des erreurs
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur : Document existant." });
  }
});

// API de connexion
app.use("/login", async (req, res) => {
  // Recuperation du corps de la requete
  // Et affichage pour test
  const data = req.body;
  console.log("Activation de login");
  console.log(data);

  try {
    // Initialisation des variables de bases
    // L'Email est null parce que la fonction
    //  de Verification des informations de l'Utilisateur
    // prend 03 arguments de bases
    const userEmail = " ";
    const userName = data["userName"];
    const password = data["password"];

    // console.log(userEmail)
    // Fonction de verification de l'existence du user
    // Elle retourne l'IdToken
    // le profil et
    // L'etat du control parental
    const user = await checkUserData(userEmail, userName, password);

    // Affichage test
    console.log("Token Id " + user.tokenId);
    console.log("User Profil " + user.profil);
    console.log("L'utilisateur a le profil :" + user.profil);

    // Verifions si le l'Utilisateur est retrouvé
    if (user.tokenId != null) {
      // Recuperation du token de l'Utilisateur
      const token = await recupToken(user.tokenId);
      // Affichage test
      // console.log(token)
      // Decodage du token pour l'envoi au User
      const decodedToken = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString("utf-8")
      );
      // Envoi de la reponse au frontend si utilisateur trouvé
      res.status(200).send({
        message: "Utilisateur trouvé avec ces informations.",
        tokenId: decodedToken,
      });
    }
    // Envoie d'une erreur en cas de recherche infructueuse
    else
      res.status(404).send({
        message: "Erreur: Aucun utilisateur trouvé avec ces informations.",
      });
  } catch (error) {
    // Gestion des erreurs
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// // API de connexion en or
// app.use("/goldenLogin", async (req, res) => {

//     // Recuperation du corps de la requete
//     // Le corps ne contient que l'email de l'utilisateur
//     // Et affichage pour test
//     const data = req.body
//     console.log("Activation de login")
//     console.log(data)

//     try {
//         const userEmail = data['userEmail']

//         // console.log(userEmail)

//         // Recuperation de l'Id du token dans l'enregistrement User
//         const user = await checkUserData(userEmail, " ", " ")
//         console.log("Token Id " + user.tokenId)
//         console.log("User Profil " + user.profil)
//         console.log("L'utilisateur a le profil :" + user.profil)

//         if (user.tokenId != null) {

//             // Recuperation de tout l'enregistrement du token a l'aide de son id
//             const token = await recupToken(user.tokenId)
//             // Affichage test
//             // console.log(token)
//             // Decodage du token pour l'envoi au User
//             const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
//             // Envoi de la reponse au frontend
//             res.status(200).send({ "message": "Utilisateur trouvé avec ces informations.", "tokenId": decodedToken });
//         }
//         else
//             res.status(404).send({ "message": "Erreur: Aucun utilisateur trouvé avec ces informations." })

//     } catch (error) {
//         // Gestion des erreurs
//         console.error("Une erreur s'est produite :", error);
//         res.status(500).send({ "message": 'Erreur serveur' });
//     }
// })

// API de demande d'obtention de profil
app.use("/profilAsking", async (req, res) => {
  // Recuperation du corps de la requete
  // Et affichage pour test
  const data = req.body;
  console.log("Activation de profilAsking");
  console.log(data);

  try {
    // Récupération des informations de l'Utilisateur
    // Envoyées du front end
    const userEmail = " ";
    const userName = data["userName"];
    const password = data["password"];
    const newProfil = data["newProfil"];

    // Fonction de vérification de l'existence d'un utilisateur
    // Elle renvoit le token et le profil de l'Utilisateur
    const user = await checkUserData(userEmail, userName, password);

    // Fonction de vérification de la récupération
    // effective du profil de l'Utilisateur
    if (user.profil != null) {
      const dataType = "askingProfil";
      // Tab des Profils existant afin de faire une sérialisation de cette data
      //const profilTab = ['Super Utilisateur', 'Animateur', 'Enseignant', 'Parent', 'Auteur', 'Marchand', 'Apprenant', 'Client']

      // Fonction d'envoi de demande de profil
      // Il s'agit surtout d'enregistrer la demande
      // Pour qu'un administration puisse valider la demande ultérieurement
      const AskingInfoId = await sendProfilAsking(
        userName,
        user.profil,
        newProfil
      );

      // Fonction de récupération du token de l'Utilisateur
      // Pour y enregistrer les differentes interactions de l'Utilisateur
      const token = await recupToken(user.tokenId);

      // Fonction de modification des informations du token
      // Elle renvoit le token modifé et re-encoder
      const updatedToken = await modifiedToken(token, AskingInfoId, dataType);

      // Fonction de mise a jour du token de l'Utilisateur en ligne
      // Elle fait une mise a jour des informations de la Base de donnée
      // Elle renvoit un booléen
      const isUpdate = await updateToken(user.tokenId, "", updatedToken);

      // Fonction de decodage du Token mise a jour
      // Elle sera renvoyée au Frontend
      const decodedToken = jwt.decode(updatedToken, { complete: true });

      // Fonction de vérification de la mise a jour en ligne
      // effective du nouveau token
      if (isUpdate)
        res.status(200).send({
          message:
            "Demande envoyée avec succès. En attente de la validation d'un Administrateur",
          token: decodedToken,
        });
      // En cas d'échec renvoyé une erreur
      else throw error;
    } else
      res.status(200).send({
        message:
          "Erreur lors de l'envoi de la Demande d'obtention de profil non !!",
      });
  } catch (error) {
    // Gestion des erreurs
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// // API de demande d'obtention de profil
// app.use("/goldenProfilAsking", async (req, res) => {

//     // Recuperation du corps de la requete
//     // Le corps ne contient que l'email de l'utilisateur
//     // Et affichage pour test
//     const data = req.body
//     console.log("Activation de profilAsking")
//     console.log(data)

//     try {
//         // Récupération des informations de l'Utilisateur
//         // Envoyées du front end
//         const userEmail = data['userEmail']

//         const newProfil = data['newProfil']

//         // Fonction de vérification de l'existence d'un utilisateur
//         // Elle renvoit le token et le profil de l'Utilisateur
//         const user = await checkUserData(userEmail)

//         // Fonction de vérification de la récupération
//         // effective du profil de l'Utilisateur
//         if (user.profil != null) {
//             const dataType = 'askingProfil'
//             // Tab des Profils existant afin de faire une sérialisation de cette data
//             //const profilTab = ['Super Utilisateur', 'Animateur', 'Enseignant', 'Parent', 'Auteur', 'Marchand', 'Apprenant', 'Client']

//             // Fonction d'envoi de demande de profil
//             // Il s'agit surtout d'enregistrer la demande
//             // Pour qu'un administration puisse valider la demande ultérieurement
//             const AskingInfoId = await sendProfilAsking(userEmail, user.profil, newProfil)

//             // Fonction de récupération du token de l'Utilisateur
//             // Pour y enregistrer les differentes interactions de l'Utilisateur
//             const token = await recupToken(user.tokenId)

//             // Fonction de modification des informations du token
//             // Elle renvoit le token modifé et re-encoder
//             const updatedToken = await modifiedToken(token, AskingInfoId, dataType)

//             // Fonction de mise a jour du token de l'Utilisateur en ligne
//             // Elle fait une mise a jour des informations de la Base de donnée
//             // Elle renvoit un booléen
//             const isUpdate = await updateToken(user.tokenId, "", updatedToken)

//             // Fonction de decodage du Token mise a jour
//             // Elle sera renvoyée au Frontend
//             const decodedToken = jwt.decode(updatedToken, { complete: true });

//             // Fonction de vérification de la mise a jour en ligne
//             // effective du nouveau token

//             if (isUpdate)
//                 res.status(200).send({ "message": "Demande envoyée avec succès. En attente de la validation d'un Administrateur", "token": decodedToken });
//             // En cas d'échec renvoyé une erreur
//             else
//                 throw error;
//         }
//         else
//             res.status(200).send({ "message": "Erreur lors de l'envoi de la Demande d'obtention de profil non !!" })

//     } catch (error) {
//         // Gestion des erreurs
//         console.error("Une erreur s'est produite :", error);
//         res.status(500).send({ "message": 'Erreur serveur' });
//     }
// })

// API de téléchargement de document
app.use("/downloadPDF", async (req, res) => {
  // Recuperation du corps de la requete
  // Le corps contiendra NomDoc et le UserName
  // Et affichage pour test
  const data = req.body;
  console.log("Activation de downloadPDF");
  console.log(data);

  try {
    // INitialisation des variables de bases
    // email et password sont nulles
    // car la fonction de verification de l'existence de l'Utilisateur
    // peut etre utiliser juste avec le userName
    const userEmail = " ";
    const userName = data["userName"];
    const password = " ";
    const nomDoc = data["nomDoc"];
    // typeDoc est à assimilé avec Destination folder
    const typeDoc = data["typeDoc"];
    // console.log(userEmail)
    // Fonction de verification de l'existence d'un document
    const file = await checkPDFExistance(nomDoc, typeDoc);
    // console.log(file)

    // Si le document est introuvable
    // Message d'erreur au frontend
    if (!file) {
      console.log("Document introuvable");
      res.status(200).send({ message: "Doument introuvable." });
    }
    // Si le document est trouvé alors
    // On procede au telechargement
    else {
      const doc = await downloadPDF(file.nomDoc, typeDoc);
      // En cas d'erreur lors du telechargement arreter le process
      // et generer une erreur
      if (doc == null) {
        console.log("Erreur lors du téléchargement.");
        return;
      }
      // Si il n'y a pas d'erreur alors
      else {
        const dataType = "docDownload";
        // JSON de sauvegarde des informations du telechargement
        const docDownload = { typeDoc: typeDoc, NomDoc: file.nomDoc };
        // Fonction de verification de l'existence de l'Utilisateur
        // Elle retourne le tokenId, le profil et l'etat du control parental
        const user = await checkUserData(userEmail, userName, password);
        // Fonction de récupération du token de l'Utilisateur
        // Pour y enregistrer les differentes interactions de l'Utilisateur
        const token = await recupToken(user.tokenId);

        // Fonction de modification des informations du token
        // Elle renvoit le token modifé et re-encoder
        const updatedToken = await modifiedToken(token, docDownload, dataType);

        // Fonction de mise a jour du token de l'Utilisateur en ligne
        // Elle fait une mise a jour des informations de la Base de donnée
        // Elle renvoit un booléen
        const isUpdate = await updateToken(user.tokenId, "", updatedToken);

        // Fonction de decodage du Token mise a jour
        // Elle sera renvoyée au Frontend
        const decodedToken = jwt.decode(updatedToken, { complete: true });

        // Fonction de vérification de la mise a jour en ligne
        // effective du nouveau token

        if (isUpdate) console.log("Token mis a jour avec succes.");
        res.status(200).send({
          message: "Doument téléchargéa avec succès.",
          doc: doc,
          token: decodedToken,
        });
      }
    }
  } catch (error) {
    // Gestion des erreurs
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de téléchargement des documents de demande d'obtention de profil
// C'est une API Administrateur
app.use("/studyProfilAsking", async (req, res) => {
  try {
    // Recuperation du corps de la requete
    // Et affichage test
    const data = req.body;
    console.log("Activation de studyProfilAsking");
    console.log(data);

    // Recuperation du corps de la requete
    // Et affichage pour test
    const userEmail = " ";
    const userName = data["userName"];
    const password = " ";

    // console.log(userEmail)
    // Fonction de verification de l'existence d'un document
    const user = await checkUserData(userEmail, userName, password);

    // Verifions si le profil de l'Utilisateur est bien Animateur
    // Car cette API réservé au Animateur
    if (user.profil == "Animateur") {
      // Fonction de recuperation de toutes les demande
      // d'Obtention de profil
      const allAsking = await recupAllProfilsAsking();
      // console.log(allAsking)

      // Envoie de la reponse au frobntend
      res.status(500).send({ message: "Felicitation", asking: allAsking });
    }
    // Si l'utilisateur ne dispose pas du oprofil adapté
    else {
      console.log("Erreur Utilisateur sans autorisation.");
      res
        .status(500)
        .send({ message: "Erreur Utilisateur sans autorisation." });
    }

    // Gestion des erreurs
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de  téléchargement des documents de demande d'obtention de profi
app.use("/studyUploadAsking", async (req, res) => {
  try {
    // recuperatipn du corps de la requete
    // et affichage test
    const data = req.body;
    console.log("Activation de studyUploadAsking");
    console.log(data);

    // Recuperation du corps de la requete
    // Le corps ne contient que le UserName de l'utilisateur
    // Et affichage pour test
    const userEmail = " ";
    const userName = data["userName"];
    const password = " ";
    //const profilTab = ['Super Utilisateur', 'Animateur', 'Enseignant', 'Parent', 'Auteur', 'Marchand', 'Apprenant', 'Client']

    // Fonction de verification de l'existence d'un document
    const user = await checkUserData(userEmail, userName, password);

    // Verifions si le profil de l'Utilisateur est bien Animateur
    // Car cette API réservé au Animateur
    if (user.profil == "Animateur") {
      // Fonction de recuperation de toute les demande
      // de mise a jour de profil
      const allAsking = await recupAllUploadAsking();
      // console.log(allAsking)
      res
        .status(500)
        .send({ message: "Felicitation", uploadAsking: allAsking });
    }
    // Si l'utilisateur ne dispose pas du profil adapté
    // Affichage d'erreur et envoie au frontend
    else {
      console.log("Erreur vous n'etes pas un admin.");
      res.status(500).send({
        message:
          "Erreur Utilisateur sans autorisation. Vous n'etes pas un admin",
      });
    }

    // Gestion des erreurs
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de recherche d'un document avec le domaine d'Etude
app.use("/seachingDoc", async (req, res) => {
  try {
    // Recuperation du corps de la requete
    // et affichage test
    const data = req.body;
    console.log("Activation de seachingDoc");
    console.log(data);

    // Initialisation des variables de bases
    const typeDoc = data["typeDoc"];
    const keyWord = data["KeyWord"];
    const optionSearch = data["optionSearch"];

    // Fonction de recherche d'un document
    // Selon l'option de recherche, elle se fera par
    // mot cle et par thematique
    const files = await checkPDFExistanceByTheme(
      typeDoc,
      keyWord,
      optionSearch
    );

    // Si le ou les documents sont recuperés
    // Alors on les retourne au frontend
    if (files != null && files != [] && files != false) {
      console.log("Documents trouvés");
      res.status(500).send({ message: "Documents trouvés", Docs: files });
    }
    // Si aucun document n'est trouvé alors
    // On envoie l'erreur au frontend
    else if (!files) {
      console.log("Aucun document trouvé pour Domaine d'étude.");
      res.status(404).send({
        message: "Aucun document trouvé pour Domaine d'étude",
        Docs: files,
      });
    }
    // Gestion de erreurs
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API d'achat de document
// Elle s'occupe surtout d'ajouter le document au panier
app.use("/buyDoc", async (req, res) => {
  try {
    // REcuperation du corps de la requete
    // Et affichage test
    const data = req.body;
    console.log("Activation de buyDoc");
    console.log(data);

    // Initialisation des variables de bases
    // Et affichage pour test
    const typeDoc = data["typeDoc"];
    const FileName = data["fileName"];
    const userName = data["userName"];
    const userEmail = " ";
    const password = " ";
    const dataType = "panier";

    // Verification de l'existence de l'Utilisateur
    const user = await checkUserData(userEmail, userName, password);

    // Verification de l'existence du fichier
    // et recuperation au passage de quelques infos
    // dont le nom du document
    // Le prix si il en as un
    const file = await checkPDFExistance(FileName, typeDoc);
    // Constittion de panier de l'utilisateur
    const basket = { typeDoc: typeDoc, NomDoc: file.nomDoc, prix: file.prix };

    // recuperation du token de l'utilisateur
    const token = await recupToken(user.tokenId);

    // Modification du token
    const updatedToken = await modifiedToken(token, basket, dataType);

    // Mise a jour en ligne du token modifié
    const isUpdate = await updateToken(user.tokenId, "", updatedToken);

    // Decodage du token
    const decodedToken = jwt.decode(updatedToken, { complete: true });

    // Envoie de la reponse au frontend
    if (isUpdate) console.log("Token mis a jour avec succes.");
    res
      .status(200)
      .send({ message: "Doument ajouté au panier avec succes.", decodedToken });

    // Gestion des erreurs
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API d'achat de document avec Email seul
app.use("/buyDocByEmail", async (req, res) => {
  try {
    // Recuperation du corps de la requete
    // Et affichage test
    const data = req.body;
    console.log("Activation de buyDoc");
    console.log(data);

    // Initialisation des infos de bases
    const typeDoc = data["typeDoc"];
    // By Theme ou KeyWord
    const FileName = data["fileName"];
    const userEmail = data["userEmail"];
    const dataType = "panier";

    // Verification de l'existence de l'Utilisateur avec son email
    const user = await checkUserEmail(userEmail);

    // Verification de l'existence du fichier
    // et recuperation au passage de quelques infos
    const file = await checkPDFExistance(FileName, typeDoc);
    // Constittion de panier de l'utilisateur
    const basket = { typeDoc: typeDoc, NomDoc: file.nomDoc, prix: file.prix };

    // recuperation du token de l'utilisateur
    const token = await recupToken(user.tokenId);

    // Modification du token
    const updatedToken = await modifiedToken(token, basket, dataType);

    // Mise a jour en ligne du token modifié
    const isUpdate = await updateToken(user.tokenId, "", updatedToken);

    // Decodage du token
    const decodedToken = jwt.decode(updatedToken, { complete: true });

    // Si la mise a jour est effective alors
    // renvoie de la reponse au frontend
    if (isUpdate) console.log("Token mis a jour avec succes.");
    res
      .status(200)
      .send({ message: "Doument ajouté au panier avec succes.", decodedToken });

    // Gestion des erreurs
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de paiement pour un document
app.use("/payDoc", async (req, res) => {
  try {
    // Recuperation du corps de la requete
    // Et affichage test
    const data = req.body;
    console.log("Activation de payDoc");
    console.log(data);

    // Recuperation du corps de la requete
    // Et affichage pour test
    const userName = data["userName"];
    const userEmail = " ";
    const password = " ";
    const dataType = "panier";

    // Verification de l'existence de l'Utilisateur
    const user = await checkUserData(userEmail, userName, password);

    // recuperation du token de l'utilisateur
    const token = await recupToken(user.tokenId);

    // Affichage test
    // console.log(token)

    // Extraction des informations du token
    const basketInfos = await extractTokenInfos(token, dataType);

    // Recuperation du coup total des document ajouter au panier
    const amount = await totalCost(basketInfos);

    // Vider le panier puisqu'ils ont ete payé
    const newToken = await emptyTokenInfo(token, dataType);

    // Fonction de mise a jour du token
    const isUpdate = await updateToken(user.tokenId, " ", newToken);

    // Decodage du token pour l'envoyer au frontend
    const decodedToken = jwt.decode(newToken, { complete: true });

    // Si la mise a jour est effective
    // alors renvoie au frontend
    if (isUpdate) console.log("Token mis a jour avec succes.");
    res.status(200).send({
      message: "Extraction des Documents effectuée avec succes.",
      infosPanier: basketInfos,
      prixTotal: amount,
      token: decodedToken,
    });

    // Gestion des erreurs
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de paiement pour un document avec Email seul
app.use("/payDocByEmail", async (req, res) => {
  try {
    const data = req.body;
    console.log("Activation de payDocByEmail");
    console.log(data);

    // Recuperation du corps de la requete
    // Le corps ne contient que l'email de l'utilisateur
    // Et affichage pour test
    // By Theme ou KeyWord
    const userEmail = data["userEmail"];
    const dataType = "panier";
    //const profilTab = ['Super Utilisateur', 'Animateur', 'Enseignant', 'Parent', 'Auteur', 'Marchand', 'Apprenant', 'Client']
    // Verification de l'existence de l'Utilisateur
    const user = await checkUserEmail(userEmail);
    // Fonction de recupreration du toeken de l'Utilisateur
    const token = await recupToken(user.tokenId);

    //Affchage test
    //console.log(token)\

    // FOnction d'extraction des information du token
    const basketInfos = await extractTokenInfos(token, dataType);

    // Fonction de calcul du cout total des documents du panier
    const amount = await totalCost(basketInfos);

    // Fonction de vidage du panier
    const newToken = await emptyTokenInfo(token, dataType);
    // Fonction de mise a jour du token
    const isUpdate = await updateToken(user.tokenId, " ", newToken);

    // Fonction de decodage du token
    const decodedToken = jwt.decode(newToken, { complete: true });

    // Si la mise a jour est effective alors
    // Affichage test et envoie de la reponse au frontend
    if (isUpdate) console.log("Token mis a jour avec succes.");
    res.status(200).send({
      message: "Extraction des Documents effectuée avec succes.",
      infosPanier: basketInfos,
      prixTotal: amount,
      token: decodedToken,
    });

    // Gestion des erreurs
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de validation de la publication d'un document
app.use("/validPubDoc", async (req, res) => {
  try {
    // Recuperation du corps de la requete
    // Et affichage test
    const data = req.body;
    console.log("Activation de validPubDoc");
    console.log(data);

    //Initialisation des variables de bases
    // Et affichage pour test
    const typeDoc = data["typeDoc"];
    const FileName = data["fileName"];
    const userName = data["userName"];
    const userEmail = " ";
    const password = " ";

    // Verification de l'existence de l'Utilisateur
    const user = await checkUserData(userEmail, userName, password);
    // Verification de l'existence du fichier
    // et recuperation au passage de quelques infos
    const file = await checkPDFExistance(FileName, typeDoc);
    console.log(file.nomDoc + " => " + file.prix);

    // Verification du profil de l'utilisateur
    if (user.profil == "Animateur") {
      // Validation de la publicastion officielle du document
      // Desormais disponible dans le depot officiel
      validDoc(file.doc, typeDoc);
      // Affichage test et envoie de la reponse au frontend
      console.log("Publication du Document valider avec succes.");
      res
        .status(500)
        .send({ message: "Publication du Document valider avec succes." });
    }
    // Si l'utilisateur n'a pas le bon profil alors erreur envoyé au forntend
    else {
      console.log("Erreur Utilisateur sans autorisation.");
      res
        .status(500)
        .send({ message: "Erreur Utilisateur sans autorisation." });
    }

    // Gestion des erreurs
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API d'activation du control parental
app.use("/activeParentControl", async (req, res) => {
  try {
    const data = req.body;
    console.log("Activation de activeParentControl");
    console.log(data);

    // Recuperation du corps de la requete
    // Le corps ne contient que l'email de l'utilisateur
    // Et affichage pour test
    const childname = data["childName"];
    const parentName = data["parentName"];
    const userEmail = " ";
    const password = " ";
    //const profilTab = ['Super Utilisateur', 'Animateur', 'Enseignant', 'Parent', 'Auteur', 'Marchand', 'Apprenant', 'Client']
    // Verification de l'existence de l'Utilisateur
    const parent = await checkUserData(userEmail, parentName, password);
    const child = await checkUserData(userEmail, childname, password);

    if (
      (parent.profil == "Parent" || parent.profil == "Animateur") &&
      child.profil == "Client"
    ) {
      // Fonction d'activation de controle parental
      const activated = await activeParentControl(childname);
      if (activated) {
        console.log("Control parental activer avec succes.");
        res
          .status(500)
          .send({ message: "Control parental activer avec succes." });
      } else {
        console.log("Erreur lors de l'activation du control parental.");
        res.status(500).send({
          message: "Erreur lors de l'activation du control parental.",
        });
      }
    } else {
      console.log("Erreur Utilisateur sans autorisation.");
      res
        .status(500)
        .send({ message: "Erreur Utilisateur sans autorisation." });
    }
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de recuperation de tous les document telecharges par un enfant a
app.use("/getAllDocDownloadByMyChild", async (req, res) => {
  try {
    const data = req.body;
    console.log("Activation de getAllDocDownloadByMyChild");
    console.log(data);

    // Recuperation du corps de la requete
    // Le corps ne contient que l'email de l'utilisateur
    // Et affichage pour test
    const childname = data["childName"];
    const parentName = data["parentName"];
    const userEmail = " ";
    const password = " ";
    //const profilTab = ['Super Utilisateur', 'Animateur', 'Enseignant', 'Parent', 'Auteur', 'Marchand', 'Apprenant', 'Client']
    // Verification de l'existence de l'Utilisateur
    const parent = await checkUserData(userEmail, parentName, password);
    const child = await checkUserData(userEmail, childname, password);

    if (
      (parent.profil == "Parent" || parent.profil == "Animateur") &&
      child.profil == "Client" &&
      child.controlState == true
    ) {
      const token = await recupToken(child.tokenId);
      const typeDoc = "docDownload";
      const activated = await extractTokenInfos(token, typeDoc);
      if (activated != null) {
        console.log("Informations recuperer avec succes.");
        res.status(500).send({
          message: "Informations recuperer avec succes.",
          infos: activated,
        });
      } else {
        console.log("Erreur lors de la recuperation des infos.");
        res
          .status(500)
          .send({ message: "Erreur lors de la recuperation des infos." });
      }
    } else {
      console.log(
        "Erreur control Parental non activé ou Utilisateur sans autorisation."
      );
      res.status(500).send({
        message:
          "Erreur control Parental non activé ou Utilisateur sans autorisation.",
      });
    }
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

// API de validation du changement de profil
app.use("/validProfilUpdate", async (req, res) => {
  try {
    const data = req.body;
    console.log("Activation de validProfilUpdate");
    console.log(data);

    // Recuperation du corps de la requete
    // Le corps ne contient que l'email de l'utilisateur
    // Et affichage pour test
    // By Theme ou KeyWord
    const adminName = data["adminName"];
    const userName = data["userName"];
    const userEmail = " ";
    const password = " ";
    const newProfil = data["newProfil"];
    const dataType = "profil";
    //const profilTab = ['Super Utilisateur', 'Animateur', 'Enseignant', 'Parent', 'Auteur', 'Marchand', 'Apprenant', 'Client']
    // Verification de l'existence de l'Utilisateur
    const user = await checkUserData(userEmail, userName, password);
    const admin = await checkUserData(userEmail, adminName, password);

    if (admin.profil == "Animateur") {
      const validated = await validUpdate(userName, newProfil);
      const token = await recupToken(user.tokenId);
      const newToken = await modifiedToken(
        token,
        validated.updatedUser,
        dataType
      );

      const isUpdate = await updateToken(user.tokenId, " ", newToken);
      const decodedToken = jwt.decode(newToken, { complete: true });

      if (validated && isUpdate) {
        console.log("Mise à jour de profil valider avec succes.");
        res.status(500).send({
          message: "Mise à jour de profil valider avec succes.",
          token: decodedToken,
        });
      } else {
        console.log("Erreur : Mise à jour de profil non effectuée.");
        res
          .status(500)
          .send({ message: "Erreur : Mise à jour de profil non effectuée." });
      }
    } else {
      console.log("Erreur Utilisateur sans autorisation.");
      res
        .status(500)
        .send({ message: "Erreur Utilisateur sans autorisation." });
    }
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
});

app.listen(port, () => {
  console.log("Server is listen to port ", port);
});
