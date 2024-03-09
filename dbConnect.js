const admin = require('firebase-admin');
const jwt = require('jsonwebtoken')
//const kkiapay = require('kkiapay');
const serviceAccount = require('./my-edutheque-data-firebase-adminsdk-t14gz-b43be089a5.json');
const emailValidator = require('email-validator');
const { createToken } = require('./userToken');
const Epreuve = require('./Models/Epreuve')
const Livre = require('./Models/Livre')
const Memoire = require('./Models/Memoire')
const User = require('./Models/User')
const secretKey = 'ProjetEduTechL3IM23-24';

let errorMsg

// Initialisation de Firebase Admin SDK avec les informations d'identification du service
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-edutheque-data.firebaseio.com", // URL de votre base de données Firestore
  storageBucket: 'gs://my-edutheque-data.appspot.com' // Remplacez "votre-bucket" par le nom de votre bucket Firebase Storage

});


const db = admin.firestore();


const Utilisateurs = db.collection('Utilisateurs')
const Tokens = db.collection('UserToken')
const Epreuves = db.collection('Epreuves')
const Livres = db.collection('Livres')
const Mémoires = db.collection('Mémoires')
const ProfilAsking = db.collection('ProfilAsking')
const FirstStockEpreuves = db.collection('FirstStockEpreuves')
const FirstStockLivres = db.collection('FirstStockLivres')
const FirstStockMemoires = db.collection('FirstStockMémoire')
const AvisInternautes = db.collection('Avis Internaute')
const UploadAsking = db.collection('UploadAsking')

// Fonction de génération de la date du jour
function getCurrentDate() {
  const today = new Date();
  const currentDay = today.getDate().toString().padStart(2, '0');
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = today.getFullYear();
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentSecond = today.getSeconds();


  return `${currentDay}/${currentMonth}/${currentYear}  ${currentHour}:${currentMinute}:${currentSecond}`;
}

// Fonction de cheking des informations reçues
function checkUserInfos(userEmail, age, niveauEtude, classAnnée, estMembreConseilPedagogique, nomUser, profil, sexe) {
  const tabNiveauEtude = ['Maternel', 'Primaire', 'Secondaire', 'Universitaire']
  const tabClassePrimaire = ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2']
  const tabClasseSecondaire = ['6 ème', '5 ème', '4 ème', '3 ème', '2 nd', '1 ère', 'Tle']
  const tabAnneeUniversitaire = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat 1', 'Doctorat 2', 'Doctorat 3']

  if (niveauEtude !== tabNiveauEtude[0] || niveauEtude !== tabNiveauEtude[1] || niveauEtude !== tabNiveauEtude[2] || niveauEtude !== tabNiveauEtude[3])
    return false

  if (!emailValidator.validate(userEmail))
    return false

  if (isNaN(age))
    return false

  if (estMembreConseilPedagogique != true || !estMembreConseilPedagogique != false)
    return false


}


//Fonction de verification de l'existence d'un User
async function nomUserCheking(userName) {
  try {
    // Constante de recuperation d'un Document 
    const user = await Utilisateurs
      .where('NomUser', '==', userName)
      .get();

    // Vérifier si des documents correspondants ont été trouvés
    if (user.empty) {
      console.log('Félicitation, Ce nom D\'Utilisateur est nouveau.');
      return false;
    } else {
      console.log('Erreur, Ce nom d\'Utilisateur existe deja.');
      return true;
    }
    // Gestion des erreurs
  } catch (error) {
    console.error('Erreur lors de la recherche de nom d\'utilisateur :', error);
    throw error;
  }
}

// Fonction de creation d'un utilisateur
async function addUser(email = "", age = "", niveauEtude = "", classAnnée = "", password = "", npi = "", nomUser = "", sexe = "", tel = "") {
  try {
    // Générer la date du jour
    const today = getCurrentDate();


    // Creation d'un objet User
    const userObject = new User(today, nomUser, classAnnée, niveauEtude, password, npi, age, sexe, email, tel)
    // Conversion au format json
    const utilisateur = userObject.toJSON()
    console.log(utilisateur)
    // Ajouter des données à une collection 
    const docRef = await Utilisateurs.add(utilisateur);
    // Recuperation de l'id et de tout le document créé
    const userId = docRef.id;
    const user = await docRef.get();
    console.log('Utilisateur ajouté avec ID :', userId);

    // On renvoi les deux infos 
    return { userId: userId, user: user };

    // Gestion des erreurs 
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document :', error);
    throw error; // Renvoyer l'erreur pour la traiter ailleurs si nécessaire
  }
}

// Fonction de creation d'un utilisateur simple 
async function addSimpleUser(userName, npi, password) {
  try {
    // Générer la date du jour
    const today = getCurrentDate();
    // Creation du champs token 
    // Il reste vide pour l'instant 
    let tokenId = ''
    let profil = "Client"

    // Ajouter des données à une collection 
    const docRef = await Utilisateurs.add({
      NomUser: userName,
      NPI: npi,
      MotPasse: password,
      Profil: profil,
      TokenId: tokenId,
      ControlState: false
    });
    // Recuperation de l'id et de tout le document créé
    const userId = docRef.id;
    const user = await docRef.get();
    console.log('Utilisateur simple ajouté avec ID :', userId);

    // On renvoi les deux infos 
    return { userId: userId, user: user };

    // Gestion des erreurs 
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document :', error);
    throw error; // Renvoyer l'erreur pour la traiter ailleurs si nécessaire
  }
}

async function addToken(token) {
  try {
    const docRef = await Tokens.add({
      token: token
    });

    const tokenId = docRef.id;
    console.log('Token creer avec succes ID :', tokenId);

    return tokenId;
  } catch (error) {
    console.error('Erreur lors de la creation du token du document :', error);
    throw error; // Rejeter l'erreur pour la gérer à un niveau supérieur si nécessaire
  }
}

// Fonction de mise a jour d'un profil
async function validUpdate(userName, newProfil) {
  // Cette recherche permettra de faire 
  // un login plus simple
  const users = await Utilisateurs
    .where('NomUser', '==', userName)
    .get();


  // Fonction de vérification de l'existence effective de l'utilisateur
  // Ici on verifie si la constante est bien non null
  // Si elle est null, une erreur est renvoyée 
  if (users.empty) {
    console.log('Erreur, Aucun utilisateur trouvé avec ces informations.');
    return false;
  }
  let updatedUser
  // Boucler sur chaque document dans le QuerySnapshot
  users.forEach(async (userDoc) => {
    // Récupérer la référence du document
    const userRef = userDoc.ref;

    updatedUser = userRef.get()

    // Mettre à jour le document
    await userRef.update({
      Profil: newProfil
    });
  });
  // Affichage test 
  console.log('Profil mis à jour avec succès.');

  return { "bool": true, "updatedUser": updatedUser };
}


async function validDoc(doc, destinationPath) {
  try {
    // Condition pour insertion d'une Epreuve 
    if (destinationPath == "Epreuves") {
      console.log("Une Epreuve est sur le point d'etre enregistrer.")

      // Insertion d'une Epreuve 
      await Epreuves.add(
        doc
      )
        .then((docRef) => {
          console.log('Document ajouté avec ID :', docRef.id);
          return docRef.id
        })
        .catch((error) => {
          console.error('Erreur lors de l\'ajout du document :', error);
        });
    }

    // Condition pour insertion d'un Livre
    else if (destinationPath == "Livres") {
      console.log("Un livre est sur le point d'etre enregistrer.")

      await Livres.add(doc)
        .then((docRef) => {
          console.log('Document ajouté avec ID :', docRef.id);
          return docRef.id
        })
        .catch((error) => {
          console.error('Erreur lors de l\'ajout du document :', error);
        });
    }

    // Condition pour insertion d'un Mémoire
    else if (destinationPath == "Mémoires") {
      console.log("Un Memoire est sur le point d'etre enregistrer.")

      await Mémoires.add(doc)
        .then((docRef) => {
          console.log('Document ajouté avec ID :', docRef.id);
          return docRef.id
        })
        .catch((error) => {
          console.error('Erreur lors de l\'ajout du document :', error);
        });
    }
    else {
      console.log("Aucune donne reconnu pour l'insertion!")
    }
  } catch (error) {
    console.error('Erreur lors de la creation du token du document :', error);
    throw error; // Rejeter l'erreur pour la gérer à un niveau supérieur si nécessaire
  }
}
async function updateUser(userId, tokenId) {
  const docRef = Utilisateurs.doc(userId);
  console.log("TokenId : " + tokenId)
  console.log("UserId : " + userId)
  try {
    const user = await docRef.get();
    if (!user.exists) {
      throw new Error('Le Document Utilisateur avec ID ' + userId + ' n\'existe pas !');
    }
    // Mettre à jour le document avec le nouveau champ
    await docRef.update({
      TokenId: tokenId
    });
    const updatedUser = await docRef.get();

    console.log('Document Utilisateur mis à jour avec succès.');
    return updatedUser;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document Utilisateur:', error);
  }
}

// Fonction de mise a jour en ligne du token
// les deux derniers ont des valeurs par defaut 
// En fait, cette finction sert a jour un token en modifiant son contenu 
// fondamental que sont les informations d'un utilisateur
// Mais lors d'une simple action de l'Utilisateur 
// il ne faut alors modifier que l'essentiel
async function updateToken(tokenId, updatedUser = '', modifiedToken = '') {
  // recherche du token avec son id 
  const docRef = Tokens.doc(tokenId);

  // Affichage test
  // console.log("TokenId : "+tokenId)
  // console.log("UserId : "+userId)
  try {
    // Récupération du contenu de la recherche
    const token = await docRef.get();
    // Verification de l'existance du token
    if (!token.exists)
      throw new Error('Le Token n\'existe pas !');

    // Ce parametre est un token modifié
    // Apres une action de l'utilisateur
    // Alors je l'insert directement dans la Base de donnée
    if (modifiedToken != '') {
      // Affichage de debugage
      // console.log("Sub Block reached.")

      // Mise a jour en ligne du token 
      // Modification supperficielle 
      try {
        await docRef.update({
          token: modifiedToken
        });
        // Affichage test 
        console.log('Token mis à jour avec succès.');
        return true;

        // Gestion des erreurs
      } catch (error) {
        console.error('Erreur lors de la mise à jour du Token:', error);
      }
    }


    // Modification fondamentalle d'un token
    // Re-création du token avec un Utilisateur mise a jour
    const updatedToken = await createToken(updatedUser)
    // Mise a jour en ligne du nouveau token
    await docRef.update({
      token: updatedToken
    });

    // Affichage test et envoie du token mise a jour
    console.log('Token mis à jour avec succès.');
    return updatedToken;

    // Gestion des erreurs
  } catch (error) {
    console.error('Erreur lors de la mise à jour du Token:', error);
  }
}

// Fonction d'insertion des informations relative a un document present dans le stokage 
async function addBook(destinationPath, fileName, domainEtude, annee, niveauEtude, classAnnee, chapterTab, tagTab, auteur, isbn, prix, ecole, isFree) {
  // date actuelle 
  const dateAdd = getCurrentDate()

  // Condition pour insertion d'une Epreuve 
  if (destinationPath == "Epreuves") {
    console.log("Une Epreuve est sur le point d'etre enregistrer.")
    // Creation d'un objet Epreuve
    const epreuveObject = new Epreuve(fileName, domainEtude, chapterTab, annee, tagTab, niveauEtude, classAnnee, ecole, dateAdd)
    // Conversion au format 
    const epreuve = epreuveObject.toJSON()

    // Insertion d'une Epreuve 
    await FirstStockEpreuves.add(
      epreuve
    )
      .then((docRef) => {
        console.log('Document ajouté avec ID :', docRef.id);
        return docRef.id
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout du document :', error);
      });
  }

  // Condition pour insertion d'un Livre
  else if (destinationPath == "Livres") {
    console.log("Un livre est sur le point d'etre enregistrer.")
    // Creation d'un objet Livre
    const livreObject = new Livre(fileName, domainEtude, tagTab, annee, auteur, niveauEtude, isbn, prix, isFree, dateAdd)
    // Conversion au format json
    const livre = livreObject.toJSON()

    await FirstStockLivres.add(livre)
      .then((docRef) => {
        console.log('Document ajouté avec ID :', docRef.id);
        return docRef.id
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout du document :', error);
      });
  }

  // Condition pour insertion d'un Mémoire
  else if (destinationPath == "Mémoires") {
    console.log("Un Memoire est sur le point d'etre enregistrer.")
    // Creation d'un objet Mémoires
    const memoireObject = new Memoire(fileName, domainEtude, tagTab, ecole, annee, auteur, niveauEtude, dateAdd)
    // Conversion au format json
    const memoire = memoireObject.toJSON()

    await FirstStockMemoires.add(memoire)
      .then((docRef) => {
        console.log('Document ajouté avec ID :', docRef.id);
        return docRef.id
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout du document :', error);
      });
  }
  else {
    console.log("Aucune donne reconnu pour l'insertion!")
  }

}



async function checkUserEmail(userEmail) {
  try {
    // Fonction de recherche de l'Utilisateur 
    // dans la base 
    const users = await Utilisateurs
      .where('Email', '==', userEmail)
      .get();


    // Fonction de vérification de l'existence effective de l'utilisateur
    // Ici on verifie si la constante est bien non null
    // Si elle est null, une erreur est renvoyée 
    if (users.empty) {
      console.log('Erreur, Aucun utilisateur trouvé avec ces informations.');
      return null;
    } // Si elle est non null, alors 
    else {
      let tokenId, profil, controlState;
      users.forEach(doc => {
        const data = doc.data();

        // Récupération de L'Identifiant du Token, 
        tokenId = data.TokenId;

        // de l'etat du control Parental 
        controlState = data.ControlState

        //et du profil actuel de l'Utilisateur
        profil = data.Profil;

        // Affichage test des infomations
        console.log(tokenId)
        console.log(profil)
        console.log(controlState)

      });

      // Affichage test
      console.log('Félicitation, Utilisateur trouvé avec ces informations.');
      console.log(tokenId)

      // Envoi des informations collectées 
      return { tokenId: tokenId, profil: profil, controlState: controlState };

    }
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateur :', error);
    throw error;
  }
}

// Fonction de Verification de l'existence d'un Utilisateur
async function checkUserData(userEmail = "", userName = "", password = "") {
  try {

    let users;
    if (userEmail == " " && userName != " " && password != " ") {
      // Cette recherche permettra de faire 
      // un login plus simple
      users = await Utilisateurs
        .where('NomUser', '==', userName)
        .where('MotPasse', '==', password)
        .get();
    } else if (userEmail != " " && userName != " " && password != " ") {
      // Fonction de recherche de l'Utilisateur 
      // dans la base 
      users = await Utilisateurs
        .where('NomUser', '==', userName)
        .where('Email', '==', userEmail)
        .where('MotPasse', '==', password)
        .get();
    } else if (userEmail == " " && password == " " && userName != " ") {
      // Fonction de recherche de l'Utilisateur 
      // dans la base 
      users = await Utilisateurs
        .where('NomUser', '==', userName)
        .get();
    } else if (userName == " " && password == " " & userEmail != " ") {
      // Fonction de recherche de l'Utilisateur 
      // dans la base 
      users = await Utilisateurs
        .where('Email', '==', userEmail)
        .get();
    }
    // Fonction de vérification de l'existence effective de l'utilisateur
    // Ici on verifie si la constante est bien non null
    // Si elle est null, une erreur est renvoyée 
    if (users.empty) {
      console.log('Erreur, Aucun utilisateur trouvé avec ces informations.');
      return null;
    }
    // Si elle est non null, alors 
    else {
      let tokenId, profil, controlState;
      users.forEach(doc => {
        const data = doc.data();

        // Récupération de L'Identifiant du Token, 
        tokenId = data.TokenId;

        // de l'etat du control Parental 
        controlState = data.ControlState

        //et du profil actuel de l'Utilisateur
        profil = data.Profil;

        // Affichage test des infomations
        console.log(tokenId)
        console.log(profil)
        console.log(controlState)

      });

      // Affichage test
      console.log('Félicitation, Utilisateur trouvé avec ces informations.');
      console.log(tokenId)

      // Envoi des informations collectées 
      return { tokenId: tokenId, profil: profil, controlState: controlState };

    }
    // Génération d'une erreur si un problème survint
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateur :', error);
    throw error;
  }
}

// Fonction de Récupération d'un token a partir de son identifiant
async function recupToken(tokenId) {
  // Recherche du token 
  const token = await Tokens.doc(tokenId).get()

  // Si il n'existe pas 
  if (!token.exists) {
    // Affichage de l'erreur et aucun retour
    console.log('Le Token n\'existe pas !')
    return;
    // Si il existe alors
  } else {
    // Affichage test
    console.log("Le Token existe.")
    // Recuperation du Token
    const data = await token.data().token
    return data
  }
}

// Fonction de Verification de l'existence d'un Document // 
// Et Récupération de son intitulé complet
async function checkPDFExistance(FileName, typeDoc) {
  console.log("checkPDFExistance Start")
  try {
    let doc;
    if (typeDoc == 'Mémoires') {
      console.log("checkPDFExistance Bloc Mémoire")

      doc = await FirstStockMemoires
        .where('FileName', '==', FileName)
        .get();
    }
    if (typeDoc == 'Livres') {
      console.log("checkPDFExistance Bloc Livres")

      doc = await FirstStockLivres
        .where('FileName', '==', FileName)
        .get();
    } if (typeDoc == 'Epreuves') {
      console.log("checkPDFExistance Bloc Epreuves")

      doc = await FirstStockEpreuves
        .where('FileName', '==', FileName)
        .get();
    }

    console.log("checkPDFExistance Bloc 1")

    // Vérifier si des documents correspondants ont été trouvés
    if (doc.empty || doc == null) {

      console.log('Aucun document trouvé avec ces informations.');
      return false;

    } else {
      let nomDoc = ''
      var data;
      doc.forEach(doc => {
        data = doc.data();
        nomDoc = data.FileName;
        price = data.Prix;
      });

      console.log('Un Document a été trouvé avec ces informations.');
      console.log(nomDoc)
      console.log(price)

      return { "nomDoc": nomDoc, "prix": price, "doc": data };
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de Document :', error);
    throw error;
  }
}

// Fonction d'envoie d'une Demande d'obtention de profil
async function sendProfilAsking(userName, actualProfil, newProfil) {
  try {
    // Fonction d'insertion d'une Demande d'obtention de profil
    // dans la base 
    const docRef = await ProfilAsking.add({
      userName: userName,
      actualProfil: actualProfil,
      newProfil: newProfil
    });

    // Récupération de l'Identifiant de l'objet inséré
    const AskingInfoId = docRef.id;

    // Affichage test
    console.log('Demande d\'obtention de profil envoyée avec succes. ID :', AskingInfoId);

    // Envoie de l'information collectée
    return AskingInfoId;

    // Gestion des erreurs 
  } catch (error) {
    console.error('Erreur lors de la Demande d\'obtention de profil :', error);
    throw error; // Rejeter l'erreur pour la gérer à un niveau supérieur si nécessaire
  }
}

// Fonction de Récupération des Demandes d'obtention de profil 
async function recupAllProfilsAsking() {
  try {
    console.log("Begin recup")
    let allProfilsAsking = [];

    // Récupérer tous les documents de la collection
    const docs = await ProfilAsking.get();

    // Parcourir chaque document
    docs.forEach(doc => {
      // Récupérer les données du document
      const data = doc.data();
      allProfilsAsking.push({ id: doc.id, ...data });
    });

    const json = JSON.stringify(allProfilsAsking)
    // Écrire tous les documents dans un seul fichier JSON
    //fs.writeFileSync('allProfilsAsking.json', JSON.stringify(allProfilsAsking));
    console.log('Tous les documents ont été récupérés avec succès');

    return json
  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
  }

}

// Fonction de Récupération des Demandes d'obtention de profil 
async function recupAllUploadAsking() {
  try {
    console.log("Begin recup")
    let allEpreuvesUploadAsking = [];
    let allLivresUploadAsking = [];
    let allMemoiresUploadAsking = [];


    // Récupérer tous les documents de la collection
    const docsEpreuve = await FirstStockEpreuves.get();
    const docsLivre = await FirstStockLivres.get();
    const docsMemoire = await FirstStockMemoires.get();


    // Parcourir chaque document recu
    docsEpreuve.forEach(doc => {
      // Récupérer les données du document
      const data = doc.data();
      allEpreuvesUploadAsking.push({ id: doc.id, ...data });
    });

    // Parcourir chaque document recu
    docsLivre.forEach(doc => {
      // Récupérer les données du document
      const data = doc.data();
      allLivresUploadAsking.push({ id: doc.id, ...data });
    });

    // Parcourir chaque document recu
    docsMemoire.forEach(doc => {
      // Récupérer les données du document
      const data = doc.data();
      allMemoiresUploadAsking.push({ id: doc.id, ...data });
    });

    const jsonEpreuves = JSON.stringify(allEpreuvesUploadAsking)
    const jsonLivres = JSON.stringify(allLivresUploadAsking)
    const jsonMemoire = JSON.stringify(allMemoiresUploadAsking)

    // Écrire tous les documents dans un seul fichier JSON
    //fs.writeFileSync('allProfilsAsking.json', JSON.stringify(allProfilsAsking));
    console.log('Tous les documents ont été récupérés avec succès');

    return { "Epreuves": jsonEpreuves, "Livres": jsonLivres, "Memoire": jsonMemoire }
  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
  }

}


async function checkPDFExistanceByTheme(typeDoc, search, optionSearch) {
  console.log("checkPDFExistanceByTheme Start")
  try {
    let doc;
    if (typeDoc == 'Mémoires' && optionSearch == "DomainEtude") {
      console.log("checkPDFExistanceByDomainEtude Bloc Mémoire")

      doc = await Mémoires
        .where('DomainEtude', '==', search)
        .get();
    }
    if (typeDoc == 'Livres' && optionSearch == "DomainEtude") {
      console.log("checkPDFExistanceByDomainEtude Bloc Livres")

      doc = await Livres
        .where('DomainEtude', '==', search)
        .get();
    } if (typeDoc == 'Epreuves' && optionSearch == "DomainEtude") {
      console.log("checkPDFExistanceByDomainEtude Bloc Epreuves")

      doc = await Epreuves
        .where('DomainEtude', '==', search)
        .get();
    }



    if (typeDoc == 'Mémoires' && optionSearch == "KeyWord") {
      console.log("checkPDFExistanceByKeyWord Bloc Mémoire")

      doc = await Mémoires.get();
    }
    if (typeDoc == 'Livres' && optionSearch == "KeyWord") {
      console.log("checkPDFExistanceByKeyWord  Bloc Livres")

      doc = await Livres.get();
    } if (typeDoc == 'Epreuves' && optionSearch == "KeyWord") {
      console.log("checkPDFExistanceByKeyWord  Bloc Epreuves")

      doc = await Epreuves.get();
    }
    console.log("checkPDFExistance Bloc 1")

    // Vérifier si des documents correspondants ont été trouvés
    if (doc.empty || doc == null) {

      console.log('Erreur, aucun document trouvé avec ces informations.');
      return false;

    } else {

      if (optionSearch == "DomainEtude") {


        let Docs = []
        doc.forEach(doc => {
          const data = doc.data();
          Docs.push(data.FileName);
        });

        console.log('Félicitations, Un Document a été trouvé avec ces informations.');
        console.log(Docs)
        return Docs;
      } else if (optionSearch == "KeyWord") {
        // Vérifier si le champ est un tableau et si la valeur est présente
        let Docs = []
        doc.forEach(doc => {

          const data = doc.data();

          const fieldValue = data.TagTab;

          if (Array.isArray(fieldValue) && fieldValue.includes(search)) {

            console.log(`La valeur ${search} est présente dans le tableau.`);
            Docs.push(data.FileName);

          } else {
            console.log(`La valeur ${search} n'est pas présente dans le tableau.`);
           
          }

        });
        console.log('Félicitations, Les Documents ont été trouvé avec ces informations.');
        console.log(Docs)
        return Docs;

      }
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de Document :', error);
    throw error;
  }
}



async function activeParentControl(childName) {
  try {
    const user = await Utilisateurs
      .where('NomUser', '==', childName)
      .get();

    if (user.empty) {
      console.log('Erreur, Aucun utilisateur trouvé avec ces informations.');
      return false;
    }

    // Boucler sur chaque document dans le QuerySnapshot
    user.forEach(async (userDoc) => {
      // Récupérer la référence du document
      const userRef = userDoc.ref;

      // Mettre à jour le document
      await userRef.update({
        ControlState: true
      });
    });

    console.log('Control Parental mis à jour avec succès.');
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du Control Parental :', error);
    throw error;
  }
}


async function totalCost(basketInfos) {

  let prixTotal = 0;

  basketInfos.forEach(doc => {
    if (doc.prix) {
      prixTotal += parseInt(doc.prix);
    }
  });
  return prixTotal
}
// Exportation des fonctions
module.exports = { addUser, addSimpleUser, addToken, addBook, checkUserData, updateUser, recupToken, updateToken, nomUserCheking, checkPDFExistance, sendProfilAsking, recupAllProfilsAsking, checkPDFExistanceByTheme, recupAllUploadAsking, activeParentControl, validDoc, validUpdate, totalCost, checkUserEmail }
