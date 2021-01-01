//Adds a quest section to journal entries
Hooks.on("renderJournalSheet", async (journalSheet,html,entity) => {
    console.log(journalSheet, html, entity);
    const journal = entity.entity;
    var htmlDom = $(html)[0];
    if (htmlDom === undefined) return true;
    var formData = htmlDom.getElementsByTagName("form")[0];
    if (formData === undefined){
        formData = htmlDom;
    }
    const updateButton = formData.getElementsByTagName("button")[0];
    var questHeader = document.createElement("div");
    questHeader.setAttribute("class","incarnateQuestHeader");
    var questMainTitle = document.createElement("p");
    questMainTitle.setAttribute("class","incarnateQuestMainTitle");
    questMainTitle.innerHTML = "Quests";
    questHeader.append(questMainTitle);
    if (entity.owner){
        var questAddQuest = document.createElement("p");
        questAddQuest.setAttribute("class","incarnateAddQuest");
        var fasPlus = document.createElement("i");
        fasPlus.setAttribute("class","fas fa-plus");
        questAddQuest.append(fasPlus);
        questAddQuest.innerHTML += "Add";
        questAddQuest.addEventListener("click",JournalEntry.newQuest);
        questHeader.append(questAddQuest);
    }
    formData.insertBefore(questHeader,updateButton);
    var quests = document.createElement("div");
    quests.setAttribute("class","incarnateQuests");
    var questNodes = journal.flags.quests;
    if (questNodes !== undefined){
        if(questNodes.length > 0){
            var questNodesLen = questNodes.length;
            for (var b=0; b<questNodesLen; b++){
                var questNode = document.createElement("div");
                questNode.setAttribute("class","incarnateQuest");
                var questTitle = document.createElement("div");
                questTitle.setAttribute("class","incarnateQuestTitle");
                questTitle.innerHTML += '<input type="text" class="incarnateQuestName" name="flags.quests.' + b + '.name" placeholder="Quest Name" value="' + questNodes[b].name + '"/>';
                questTitle.innerHTML += '<input type="text" class="incarnateQuestDifficulty" name="flags.quests.' + b + '.difficulty" placeholder="Quest Difficulty" value="' + questNodes[b].difficulty + '"/>';
                var checked = questNodes[b].completed ? " checked" : "" ;
                questTitle.innerHTML += '<input type="checkbox" class="incarnateQuestCompleted" name="flags.quests.' + b + '.completed"' + checked + '/>';
                if (entity.owner){
                    var questEdit = document.createElement("a");
                    questEdit.setAttribute("class","quest-control quest-edit");
                    questEdit.setAttribute("title","Edit Quest");
                    questEdit.setAttribute("data-number",b);
                    questEdit.innerHTML = '<i class="fas fa-edit"/>';
                    questEdit.addEventListener("click",event => {
                        var questEditor = new QuestEditor(journal,Number(Reference.getClosestClass(event.srcElement,"quest-control").getAttribute("data-number")));
                        questEditor.render(true);
                    });
                    questTitle.append(questEdit);
                    var questDelete = document.createElement("a");
                    questDelete.setAttribute("class","quest-control quest-delete");
                    questDelete.setAttribute("title","Delete Quest");
                    questDelete.innerHTML = '<i class="fas fa-trash"/>';
                    questDelete.addEventListener("click",event => {
                        var quests = JSON.parse(JSON.stringify(journal.flags.quests));
                        quests.splice(Number(Reference.getClosestClass(event.srcElement,"quest-control").getAttribute("data-number")),1);
                        var journalEntity = game.journal.get(journal._id);
                        journalEntity.update({flags:{quests:quests}});
                        journalEntity.render(false);
                    });
                    questTitle.append(questDelete);
                    //questTitle.innerHTML += '<a class="quest-control quest-edit" title="Edit Quest"><i class="fas fa-edit"></i></a><a class="quest-control quest-delete" title="Delete Quest"><i class="fas fa-trash"></i></a>';
                }
                questNode.append(questTitle);
                var questDescription = document.createElement("div");
                questDescription.setAttribute("class","incarnateQuestDescription");
                var content = enrichHTML(questNodes[b].description, {secrets: entity.owner, entities: true});
                var editor = document.createElement("div");
                questDescription.append(editor);
                editor.outerHTML = '<div class="editor"><div class="editor-content" data-edit="flags.quests.' + b + '.description">' + content + '</div></div>';
                editor = questDescription.getElementsByClassName("editor")[0];
                questNode.append(questDescription);
                quests.append(questNode);
            }
            formData.insertBefore(quests,updateButton);
            // Detect and activate TinyMCE rich text editors
            // The following needs to be re-written without JQuery or this
            //html.find('.editor-content[data-edit]').each((i, div) => FormApplication.prototype._activateEditor(div));
        }
    }
    IncarnateGamingLLC.HyperlinkHelper.addHyperlinkSupportToDOM(html, journalSheet);
});
