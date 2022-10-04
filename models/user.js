
class User {
    
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }

    future(id, email, password, birthday, country) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.birthday = birthday;
        this.country = country;
    }

}

module.exports = User;
