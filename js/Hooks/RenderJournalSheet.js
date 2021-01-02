//Adds a quest section to journal entries
Hooks.on("renderJournalSheet", async (journalSheet,html, data) => {
    IncarnateGamingLLC.HyperlinkHelper.addHyperlinkSupport(html, journalSheet);
    let renderJournalHelper = new IncarnateGamingLLC.RenderJournalSheetHelper(journalSheet, html, data);
    renderJournalHelper.addQuestSupport();
    // console.log(journalSheet, html, entity);
    // const journal = entity.entity;
    // var htmlDom = $(html)[0];
    // if (htmlDom === undefined) return true;
    // var formData = htmlDom.getElementsByTagName("form")[0];
    // if (formData === undefined){
    //     formData = htmlDom;
    // }
    // const updateButton = formData.getElementsByTagName("button")[0];
    // var questHeader = document.createElement("div");
    // questHeader.setAttribute("class","incarnateQuestHeader");
    // var questMainTitle = document.createElement("p");
    // questMainTitle.setAttribute("class","incarnateQuestMainTitle");
    // questMainTitle.innerHTML = "Quests";
    // questHeader.append(questMainTitle);
    // if (entity.owner){
    //     var questAddQuest = document.createElement("p");
    //     questAddQuest.setAttribute("class","incarnateAddQuest");
    //     var fasPlus = document.createElement("i");
    //     fasPlus.setAttribute("class","fas fa-plus");
    //     questAddQuest.append(fasPlus);
    //     questAddQuest.innerHTML += "Add";
    //     questAddQuest.addEventListener("click",JournalEntry.newQuest);
    //     questHeader.append(questAddQuest);
    // }
    // formData.insertBefore(questHeader,updateButton);
    // var quests = document.createElement("div");
    // quests.setAttribute("class","incarnateQuests");
    // var questNodes = journal.flags.quests;
    // if (questNodes !== undefined){
    //     if(questNodes.length > 0){
    //         var questNodesLen = questNodes.length;
    //         for (var b=0; b<questNodesLen; b++){
    //             var questNode = document.createElement("div");
    //             questNode.setAttribute("class","incarnateQuest");
    //             var questTitle = document.createElement("div");
    //             questTitle.setAttribute("class","incarnateQuestTitle");
    //             questTitle.innerHTML += '<input type="text" class="incarnateQuestName" name="flags.quests.' + b + '.name" placeholder="Quest Name" value="' + questNodes[b].name + '"/>';
    //             questTitle.innerHTML += '<input type="text" class="incarnateQuestDifficulty" name="flags.quests.' + b + '.difficulty" placeholder="Quest Difficulty" value="' + questNodes[b].difficulty + '"/>';
    //             var checked = questNodes[b].completed ? " checked" : "" ;
    //             questTitle.innerHTML += '<input type="checkbox" class="incarnateQuestCompleted" name="flags.quests.' + b + '.completed"' + checked + '/>';
    //             if (entity.owner){
    //                 var questEdit = document.createElement("a");
    //                 questEdit.setAttribute("class","quest-control quest-edit");
    //                 questEdit.setAttribute("title","Edit Quest");
    //                 questEdit.setAttribute("data-number",b);
    //                 questEdit.innerHTML = '<i class="fas fa-edit"/>';
    //                 questEdit.addEventListener("click",event => {
    //                     var questEditor = new QuestEditor(journal,Number(Reference.getClosestClass(event.srcElement,"quest-control").getAttribute("data-number")));
    //                     questEditor.render(true);
    //                 });
    //                 questTitle.append(questEdit);
    //                 var questDelete = document.createElement("a");
    //                 questDelete.setAttribute("class","quest-control quest-delete");
    //                 questDelete.setAttribute("title","Delete Quest");
    //                 questDelete.innerHTML = '<i class="fas fa-trash"/>';
    //                 questDelete.addEventListener("click",event => {
    //                     var quests = JSON.parse(JSON.stringify(journal.flags.quests));
    //                     quests.splice(Number(Reference.getClosestClass(event.srcElement,"quest-control").getAttribute("data-number")),1);
    //                     var journalEntity = game.journal.get(journal._id);
    //                     journalEntity.update({flags:{quests:quests}});
    //                     journalEntity.render(false);
    //                 });
    //                 questTitle.append(questDelete);
    //                 //questTitle.innerHTML += '<a class="quest-control quest-edit" title="Edit Quest"><i class="fas fa-edit"></i></a><a class="quest-control quest-delete" title="Delete Quest"><i class="fas fa-trash"></i></a>';
    //             }
    //             questNode.append(questTitle);
    //             var questDescription = document.createElement("div");
    //             questDescription.setAttribute("class","incarnateQuestDescription");
    //             var content = enrichHTML(questNodes[b].description, {secrets: entity.owner, entities: true});
    //             var editor = document.createElement("div");
    //             questDescription.append(editor);
    //             editor.outerHTML = '<div class="editor"><div class="editor-content" data-edit="flags.quests.' + b + '.description">' + content + '</div></div>';
    //             editor = questDescription.getElementsByClassName("editor")[0];
    //             questNode.append(questDescription);
    //             quests.append(questNode);
    //         }
    //         formData.insertBefore(quests,updateButton);
    //         Detect and activate TinyMCE rich text editors
    //         The following needs to be re-written without JQuery or this
    //         html.find('.editor-content[data-edit]').each((i, div) => FormApplication.prototype._activateEditor(div));
        // }
    // }
});
IncarnateGamingLLC.RenderJournalSheetHelper = class RenderJournalSheetHelper{
    static defaultQuest = {
        name: 'Quest Name',
        difficulty: 'Quest Difficulty',
        description: 'Quest Description',
        reward: 'uaFtq1BTNTAoKOVd',
        rewardShared: false,
        status: 'Not Started',
    }
    constructor(journalSheet, html, data){
        this.journalSheet = journalSheet;
        this.html = html;
        this.htmlDOM = $(html)[0];
        this.data = data;
    }
    setup(){
        this.addQuestSupport();
    }
    addQuestSupport(){
        if(game.settings.get("incarnateWorldBuilding","journalQuests") === false) return true;
        this.addQuestSection();
        this.addAddQuestButton();
        this.addCurrentQuests();
    }
    addQuestSection(){
        let formSection = this.htmlDOM.getElementsByTagName('form')[0] || this.htmlDOM;
        let editorSection = formSection.getElementsByClassName('editor')[0];
        this.questDiv = IncarnateGamingLLC.ElementCreation.createDivWithHeader('Quests');
        editorSection.append(this.questDiv);
    }
    async addCurrentQuests(){
        let quests = this.data.entity.flags.quests;
        for(const [key, quest] of Object.entries(quests)){
            let questElement = document.createElement('div');
            questElement.setAttribute('data-index', key);
            questElement.setAttribute('class', 'quest');
            questElement.innerHTML = `
                <h2>${quest.name}</h2>
                <div class="d-flex"><div><strong>Difficulty:</strong> ${quest.difficulty}</div><div><strong>Status:</strong> ${quest.status}</div></div>
                <div>${quest.description}</div>`;
            if(quests.rewardShared || game.user.isGM){
                let questReward = await IncarnateGamingLLC.Reference.lookupActorComplete(quest.reward);
                if(questReward[0]){
                    questElement.innerHTML += `<span class="crossReference" data-fid="${questReward[0].data._id}" data-type="Actor">${questReward[0].data.name}</span>`;
                }
                questElement.innerHTML += ``;
                questElement.addEventListener('click', this.editQuest.bind(this));
            }
            IncarnateGamingLLC.HyperlinkHelper.addHyperlinkSupportToDOM(questElement);
            this.questDiv.append(questElement);
        }
    }
    addAddQuestButton(){
        let addButton = IncarnateGamingLLC.ElementCreation.createButtonAdd('Add New Quest', this.addQuest.bind(this), {div:true});
        this.questDiv.prepend(addButton);
    }
    addQuest(event){
        if(!this.data.entity.flags.quests){
            this.data.entity.flags.quests = {};
        }
        IncarnateGamingLLC.pushObjectIntoObject(this.data.entity.flags.quests, IncarnateGamingLLC.RenderJournalSheetHelper.defaultQuest);
        this.journalSheet.object.update({'flags.quests': this.data.entity.flags.quests});
    }
    editQuest(event){
        let questEditor = new IncarnateGamingLLC.QuestEditor(this.journalSheet.object.data, Number(event.currentTarget.getAttribute("data-index")));
        questEditor.render(true);
    }
}
