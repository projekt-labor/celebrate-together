
class Event {

    constructor(name="", text="", place="", id=0) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.place = place;
    }

    fromDB(dbo) {
        this.id = dbo.id;
        this.name = dbo.name;
        this.text = dbo.text;
        this.place = dbo.place;
        return this;
    }

}

module.exports = Event;
