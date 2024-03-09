// Ici il s'agit du model d'une Epreuve avec toutes 
// les informations la caracterisant
// Elle possède 2 methodes et un constructeur
class Epreuve {
    constructor(fileName, domainEtude, chapterTab, annee, tagTab, niveauEtude, classeAnnee, ecole, dateAdd) {
        this.FileName = fileName;
        this.DomainEtude = domainEtude;
        this.ChapterTab = chapterTab;
        this.Annee = annee;
        this.TagTab = tagTab;
        this.NiveauEtude = niveauEtude;
        this.ClassAnnee = classeAnnee;
        this.Ecole = ecole;
        this.DateAdd = dateAdd;
 
    }

    // La Méthode pour convertir la classe en objet JSON
    toJSON() {
        return {
            FileName: this.FileName,
            DomainEtude: this.DomainEtude,
            ChapterTab: this.ChapterTab,
            Annee: this.Annee,
            TagTab: this.TagTab,
            NiveauEtude: this.NiveauEtude,
            ClassAnnee: this.ClassAnnee,
            Ecole: this.Ecole,
            DateAdd: this.DateAdd

        };
    }

    // La Méthode pour créer une instance de la classe à partir d'un objet JSON
    static fromJSON(json) {
        return new Epreuve(
            json.fileName,
            json.domainEtude,
            json.chapterTab,
            json.annee,
            json.tagTab,
            json.niveauEtude,
            json.classeAnnee,
            json.ecole,
            json.dateAdd
        );
    }
}

// Exportation du model afin de le rendre 
// accesible dans d'autres fichier
module.exports = Epreuve;
