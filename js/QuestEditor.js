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
        console.log(this);
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
        var quest = this.object.flags.quests[this.questNumber];
        console.log(quest);
        return {
            owner:true,
            editable:true,
            quest:quest,
            questNumber:this.questNumber
        }
    }

    /* -------------------------------------------- */

    /**
     * Extend the definition of header buttons for Entity Sheet forms to include an option to import from a Compendium
     * @private
     */
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();
        if ( this.options.compendium ) {
            buttons.unshift({
                label: "Import",
                class: "import",
                icon: "fas fa-download",
                onclick: async ev => {
                    await this.close();
                    this.entity.collection.importFromCollection(this.options.compendium, this.entity._id);
                }
            });
        }
        return buttons;
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
        console.log(formData);
        var journal = game.journal.get(this.object._id);
        journal.update({[`flags.quests.${this.questNumber}`]:formData});
        /*
        const quests = JSON.parse(JSON.stringify(journal.data.flags.quests));
        quests[this.questNumber] = formData;
        journal.update({flags:{quests:quests}});
        */
    }
    _activateEditor(div) {console.log("clicked");

        // Get the editor content div
        console.log(this,div);
        let target = div.getAttribute("data-edit"),
            button = div.nextElementSibling,
            hasButton = button && button.classList.contains("editor-edit"),
            wrap = div.parentElement.parentElement,
            wc = $(div).parents(".window-content")[0];
        console.log(target);

        // Determine the preferred editor height
        let heights = [wrap.offsetHeight, wc ? wc.offsetHeight : null];
        if ( div.offsetHeight > 0 ) heights.push(div.offsetHeight);
        let height = Math.min(...heights.filter(h => Number.isFinite(h))) - 36;

        // Get initial content
        const data = this.object instanceof Entity ? this.object.data : this.object,
            initialContent = getProperty(data, target);

        // Add record to editors registry
        this.editors[target] = {
            target: target,
            button: button,
            hasButton: hasButton,
            mce: null,
            active: !hasButton,
            changed: false
        };

        // Define editor options
        let editorOpts = {
            target: div,
            height: height,
            setup: mce => this.editors[target].mce = mce,
            save_onsavecallback: mce => {
                this._onEditorSave(target, mce.getElement(), mce.getContent());
                if (hasButton) {
                    mce.remove();
                    button.style.display = "block";
                }
            }
        };

        // Define the creation function
        const _createEditor = (target, editorOpts, initialContent) => {
            createEditor(editorOpts, initialContent).then(mce => {
                mce[0].focus();
                mce[0].on('change', ev => this.editors[target].changed = true);
            });
        };

        // If we are using a toggle button, delay activation until it is clicked
        if (hasButton) button.onclick = event => {
            this.editors[target].changed = false;
            this.editors[target].active = true;
            button.style.display = "none";
            editorOpts["height"] = div.offsetHeight - 36;
            _createEditor(target, editorOpts, initialContent);
        };
        else _createEditor(target, editorOpts, initialContent);
    }
}
