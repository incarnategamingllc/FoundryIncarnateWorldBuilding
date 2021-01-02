/**
 *
 * @type {IncarnateGamingLLC.QuestEditor}
 */
IncarnateGamingLLC.QuestEditor = class QuestEditor extends FormApplication {
    constructor(journal,questNumber,options) {
        super(options);
        this.object = journal;
        this.form = null;
        this.filepickers = [];
        this.editors = {};
        this.questNumber = questNumber;
    }

    /* -------------------------------------------- */

    /**
     * A convenience accessor for the object property of the inherited FormApplication instance
     */
    get entity() {
        return this.object;
    }

    /* -------------------------------------------- */

    /**
     * The BaseEntitySheet requires that the form itself be editable as well as the entity be owned
     * @type {Boolean}
     */
    get isEditable() {
        return true;
    }

    /* -------------------------------------------- */

    /**
     * Assign the default options which are supported by the entity edit sheet
     */
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = ["sheet","quest-editor"];
        options.width = 500;
        options.height = window.innerHeight - 100;
        options.top = 70;
        options.left = 120;
        options.resizable = true;
        options.template = "modules/incarnateWorldBuilding/templates/incarnateQuestEditor.html";
        return options;
    }

    /* -------------------------------------------- */

    /**
     * The displayed window title for the sheet - the entity name by default
     * @type {String}
     */
    get title() {
        return this.entity.name;
    }

    /* -------------------------------------------- */

    /**
     * Default data preparation logic for the entity sheet
     */
    getData() {
        let quest = this.object.flags.quests[this.questNumber];
        return {
            owner:true,
            editable:true,
            quest:quest,
            questNumber:this.questNumber
        }
    }

    /* -------------------------------------------- */

    /**
     * Implement the _updateObject method as required by the parent class spec
     * This defines how to update the subject of the form when the form is submitted
     * @private
     */
    _updateObject(event, formData) {
        if (formData.content){
            formData.description = formData.content;
        }else if (formData.mce_0){
            formData.description = formData.mce_0;
        }
        var journal = game.journal.get(this.object._id);
        journal.update({[`flags.quests.${this.questNumber}`]:formData});
    }
}
