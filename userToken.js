const jwt = require('jsonwebtoken');
const secretKey = 'ProjetEduTechL3IM23-24';
// Options du token (expiration, algorithme de signature, etc.)
const options = {
  algorithm: 'HS256',
  issuer: 'authServer',
  subject: 'tpDriving',
  jwtid: 'uniqueTokenId',
};

// Fonction pour créer un token JWT
async function createToken(user) {
  // Informations à inclure dans le token
  const payload = {
    userdata: user,
    docDownload: [],
    Panier: [],
    AskingProfil: []
  };

  // Création du token
  const token = jwt.sign(payload, secretKey, options);
  // Envoi du token 
  return token;
}

// Fonction de modification du contenu d'un token
// Elle récupère le token et la nouvelle data
async function modifiedToken(token, newData, dataType) {
  try {
    // Decodage du token
    const decodedToken = jwt.decode(token, { complete: true });
    // const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));

    console.log(decodedToken)
    var modifiedTokenData;
    if (dataType == "docDownload") {
      // Modification du tableau des document telechargés
      decodedToken.payload.docDownload.push(newData);

      // Constitution d'une constante de modification
      modifiedTokenData = { ...decodedToken.payload };
    }
    if (dataType == "askingProfil") {
      // Modification du tableau des infos de changement
      decodedToken.payload.AskingProfil.push(newData);

      // Constitution d'une constante de modification
      modifiedTokenData = { ...decodedToken.payload };
    }
    if (dataType == "panier") {
      // Modification du tableau des infos de changement
      decodedToken.payload.Panier.push(newData);

      // Constitution d'une constante de modification
      modifiedTokenData = { ...decodedToken.payload };
    }
    if (dataType == "profil") {
      //const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));

      decodedToken.payload.userdata = newData
      modifiedTokenData = { ...decodedToken.payload }

    }

    // Affichage test
    //console.log(decodedToken)

    // Mise a jour du token en utilisant l'en-tete originelle
    const updatedToken = jwt.sign(modifiedTokenData, secretKey, { algorithm: 'HS256', header: decodedToken.header });
    // Envoie du token mis a jour
    return updatedToken;
  } catch (error) {
    // Gestion des erreurs 
    console.error('Erreur lors de la mise à jour du JWT :', error);
    return;
  }
}



async function extractTokenInfos(token, typeDoc) {
 
  // Decodage du token
  const decodedToken = jwt.decode(token, { complete: true });
 //const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));

  if (typeDoc == "panier") {
    console.log(decodedToken)
    // Recuperation du contenu du panier
    const panier = decodedToken.payload.Panier;

    // // Affichage test 
   console.log(panier)

    return panier;
  }

  if (typeDoc == "docDownload") {

    // Recuperation du contenu du panier
    const panier = decodedToken.payload.docDownload;

    // Affichage test 
    // console.log(panier)

    return panier;
  }

  if (typeDoc == "askingProfil") {

    // Recuperation du contenu du panier
    const panier = decodedToken.payload.AskingProfil;

    // Affichage test 
    // console.log(panier)

    return panier;
  }
  return null;
}



async function emptyTokenInfo(token, typeDoc) {
  // Decodage du token
  const decodedToken = jwt.decode(token, { complete: true });
  let modifiedTokenData
  if (typeDoc == "panier") {

    // Recuperation du contenu du panier
    decodedToken.payload.Panier = [];
    modifiedTokenData = { ...decodedToken.payload }

    // Mise a jour du token en utilisant l'en-tete originelle
    const updatedToken = jwt.sign(modifiedTokenData, secretKey, { algorithm: 'HS256', header: decodedToken.header });
    // Envoie du token mis a jour
    return updatedToken;
  }

  if (typeDoc == "docDownload") {

    // Recuperation du contenu du panier
    decodedToken.payload.docDownload = [];
    modifiedTokenData = { ...decodedToken.payload }

    // Mise a jour du token en utilisant l'en-tete originelle
    const updatedToken = jwt.sign(modifiedTokenData, secretKey, { algorithm: 'HS256', header: decodedToken.header });
    // Envoie du token mis a jour
    return updatedToken;
  }

  if (typeDoc == "askingProfil") {

    // Recuperation du contenu du panier
    decodedToken.payload.AskingProfil = [];
    modifiedTokenData = { ...decodedToken.payload }

    // Mise a jour du token en utilisant l'en-tete originelle
    const updatedToken = jwt.sign(modifiedTokenData, secretKey, { algorithm: 'HS256', header: decodedToken.header });
    // Envoie du token mis a jour
    return updatedToken;
  }
  return null;
}
// Exportation des fonctions 
module.exports = { createToken, modifiedToken, extractTokenInfos, emptyTokenInfo }