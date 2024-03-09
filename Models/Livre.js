// Ici il s'agit du model d'un Livre avec toutes 
// les informations le caracterisant
// Elle possède 2 methodes et un constructeur
class Livre {

    constructor(fileName, domainEtude, tagTab, annee, auteur, niveauEtude, isbn, prix, isFree, dateAdd) {
        this.FileName = fileName;
        this.DomainEtude = domainEtude;
        this.NiveauEtude = niveauEtude;
        this.TagTab = tagTab;
        this.Auteur = auteur;
        this.Annee = annee;
        this.ISBN = isbn;
        this.IsFree = isFree;
        this.Prix = prix; 
        this.DateAdd = dateAdd;

    }

    // Méthode pour convertir la classe en objet JSON
    toJSON() {
        return {
            FileName: this.FileName,
            DomainEtude: this.DomainEtude,
            NiveauEtude: this.NiveauEtude,
            TagTab: this.TagTab,
            Auteur: this.Auteur,
            Annee: this.Annee,
            ISBN: this.ISBN,
            IsFree: this.IsFree,
            Prix: this.Prix,
            DateAdd: this.DateAdd,

        };
    }

    // Méthode pour créer une instance de la classe à partir d'un objet JSON
    static fromJSON(json) {
        return new User(
            json.fileName,
            json.domainEtude,
            json.niveauEtude,
            json.tagTab,
            json.auteur,
            json.annee,
            json.isbn,
            json.isFree,
            json.prix,
            json.dateAdd,

        );
    }
}
// Exportation du model afin de le rendre 
// accesible dans d'autres fichier
module.exports = Livre;
