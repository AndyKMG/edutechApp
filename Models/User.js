// Ici il s'agit du model d'un Utilisateur avec toutes 
// les informations le caracterisant
// Elle possède 2 methodes et un constructeur
class User {
    constructor(dateInscription, nomUser, classAnnee, niveauEtude, password, npi, age, sexe, email, tel) {
        this.DateInscription = dateInscription;
        this.NomUser = nomUser;
        this.ClassAnnee = classAnnee;
        this.NiveauEtude = niveauEtude;
        this.EstMembreConseilPedagogique = false;
        this.Password = password;
        this.NPI = npi;
        this.Profil = 'Client';
        this.Age = age;
        this.Sexe = sexe;
        this.Email = email;
        this.Tel = tel;
        this.ControlParent = false;
        this.TokenId = " ";
    }

    // Méthode pour convertir la classe en objet JSON
    toJSON() {
        return {
            DateInscription: this.DateInscription,
            NomUser: this.NomUser,
            ClassAnnée: this.ClassAnnee,
            NiveauEtude: this.NiveauEtude,
            EstMembreConseilPedagogique: this.EstMembreConseilPedagogique,
            MotPasse: this.Password,
            NPI: this.NPI,
            Profil: this.Profil,
            Age: this.Age,
            Sexe: this.Sexe,
            Email: this.Email,
            Tel: this.Tel,
            TokenId: this.TokenId
        };
    }

    // Méthode pour créer une instance de la classe à partir d'un objet JSON
    static fromJSON(json) {
        return new User(
            json.dateInscription,
            json.nomUser,
            json.classAnnee,
            json.estMembreConseilPedagogique,
            json.password,
            json.npi,
            json.profil,
            json.age,
            json.sexe,
            json.email,
            json.tel,
            json.tokenId

        );
    }
}
// Exportation du model afin de le rendre 
// accesible dans d'autres fichier
module.exports = User;
