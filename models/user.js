
class User {

    constructor(nev="", email="", jelszo="", szul_datum="", telefon="", profilkep="", szul_hely="", lakhely="", id=0)
    {
        this.id = id;
        this.nev = nev;
        this.email = email;
        this.jelszo = jelszo;
        this.telefon = telefon;
        this.profilkep = profilkep;
        this.szul_datum = szul_datum;
        this.szul_hely = szul_hely;
        this.lakhely = lakhely;
    }

    fromDB(dbo) {
        this.id = dbo.id;
        this.nev = dbo.nev;
        this.email =dbo.email;
        this.jelszo = dbo.jelszo;
        this.telefon = dbo.telefon;
        this.profilkep = dbo.profilkep;
        this.szul_datum = dbo.szul_datum;
        this.szul_hely = dbo.szul_hely;
        this.lakhely = dbo.lakhely;
        return this;
    }

}

module.exports = User;
