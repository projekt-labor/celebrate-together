
class User {

    constructor(name="", email="", password="", birth_day="", phone="", profile="", birth_place="", residence="", id=0, admin=0, email_conf=0, email_code=0,pass_code=0)
    {
        this.id = id;
        this.name = name;
        this.email =email;
        this.password = password;
        this.phone = phone;
        this.profile = profile;
        this.birth_day = birth_day;
        this.birth_place = birth_place;
        this.residence = residence;
        this.admin = admin;
        this.email_conf = email_conf;
        this.email_code = email_code;
        this.pass_code = pass_code;
    }

    fromDB(dbo) {
        this.id = dbo.id;
        this.name = dbo.name;
        this.email =dbo.email;
        this.password = dbo.password;
        this.phone = dbo.phone;
        this.profile = dbo.profile;
        this.birth_day = dbo.birth_day;
        this.birth_place = dbo.birth_place;
        this.residence = dbo.residence;
        this.admin = dbo.admin;
        this.email_conf = dbo.email_conf;
        this.email_code = dbo.email_code;
        this.pass_code = dbo.pass_code;
        return this;
    }

}

module.exports = User;
