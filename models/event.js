
class Event {

    constructor(name="", text="", place="", event_date="", id=0) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.place = place;
        this.event_date = event_date;
    }

    fromDB(dbo) {
        this.id = dbo.id;
        this.name = dbo.name;
        this.text = dbo.text;
        this.place = dbo.place;
        this.event_date = dbo.event_date;
        return this;
    }

}

module.exports = Event;
