// Ici il s'agit du model d'un Memoire avec toutes 
// les informations le caracterisant
// Elle possède 2 methodes et un constructeur
class Memoire {
   
    constructor(fileName, domainEtude, tagTab, ecole, annee, auteur, niveauEtude, dateAdd) {
        this.FileName = fileName;
        this.DomainEtude = domainEtude;
        this.TagTab = tagTab;
        this.Ecole = ecole;
        this.Annee = annee;
        this.Auteur = auteur;
        this.NiveauEtude = niveauEtude;
        this.DateAdd = dateAdd;

    }
 
    // Méthode pour convertir la classe en objet JSON
    toJSON() {
        return {
            FileName: this.FileName,
            DomainEtude: this.DomainEtude,
            TagTab: this.TagTab,
            Ecole: this.Ecole,
            Annee: this.Annee,
            Auteur: this.Auteur,
            NiveauEtude: this.NiveauEtude,
            DateAdd: this.DateAdd,

        };
    }

    // Méthode pour créer une instance de la classe à partir d'un objet JSON
    static fromJSON(json) {
        return new User(
            json.fileName,
            json.domainEtude,
            json.tagTab,
            json.ecole,
            json.annee,
            json.auteur,
            json.niveauEtude,
            json.dateAdd,


        );
    }
}
// Exportation du model afin de le rendre 
// accesible dans d'autres fichier
module.exports = Memoire;
