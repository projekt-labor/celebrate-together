
class Event {

    constructor(name="", text="", place="", date="", id=0) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.place = place;
        this.date = this.date;
    }

    fromDB(dbo) {
        this.id = dbo.id;
        this.name = dbo.name;
        this.text = dbo.text;
        this.place = dbo.place;
        this.date = dbo.date;
        return this;
    }

}

module.exports = Event;
