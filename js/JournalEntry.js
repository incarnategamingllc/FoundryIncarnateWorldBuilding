/**
 *
 * @type {IncarnateGamingLLC.JournalEntry}
 */
IncarnateGamingLLC.JournalEntry = class JournalEntry {
    static newQuest (ev){
        console.log(ev,ev.srcElement,Reference.getClosestClass(ev.srcElement,"app"));
        const app = Reference.getClosestClass(ev.srcElement,"app");
        const _id = app.id.split("-")[1];
        const journal = game.journal.get(_id);
        var flags = JSON.parse(JSON.stringify(journal.data.flags))
        if (flags.quests === undefined){
            flags.quests = [];
        }
        flags.quests.push({
            name:"",
            difficulty:"",
            completed:"",
            description:""
        });
        journal.update({flags:flags});
        journal.render(false);
    }
}
