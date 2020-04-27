Hooks.on("init", async () => {
    IncarnateGamingLLC.Settings.incarnateSetupDefaults();
});
Hooks.on('ready', async () =>  {
    if (game.settings.get("incarnateWorldBuilding","anvilButtons")){
        var anvil = document.getElementById("logo")
        if ( game.user.isGM ) {
            anvil.setAttribute("onclick","IncarnateGamingLLC.incarnateGMBlind()");
        }else{
        }
        anvil.ondragover = ev => IncarnateGamingLLC.Anvil.incarnateOnDragOver(event);
        anvil.ondrop = ev => IncarnateGamingLLC.Anvil.incarnateOnDrop(event);
    }
    IncarnateGamingLLC.Calendar.incarnateSetupCalendar();
    IncarnateGamingLLC.StatRoll.incarnateSetupDefaults();
    IncarnateGamingLLC.SceneGen.incarnateSetupDefaults();
    IncarnateGamingLLC.WindowMemory.incarnateSetupDefaults();
    //Adds a preRender hook to applications
    const IncarnateApplicationRender = (function () {
        var cached_function = Application.prototype._render;
        return async function(emptyApp){
            let resume = await Hooks.call("preRender"+this.constructor.name,this);
            if (resume === false){
                return new Promise(resolve => null);
            }else{
                return cached_function.apply(this, arguments);
            }
        }
    })();
    Application.prototype._render = IncarnateApplicationRender;
    //Changes Note double left to different script
    const IncarnateNoteDoubleLeft = (function () {
        var cached_function = Note.prototype._onDoubleLeft;
        return async function(ev){
            const advance = Hooks.callAll("incarnateNoteDoubleLeft",ev,this);
            if (advance === false) return false;
            return cached_function.apply(this,arguments);
        }
    })();
    Note.prototype._onDoubleLeft = IncarnateNoteDoubleLeft;
});
//Adds support for hyperlinks in several locations
Hooks.on("renderItemSheet5e", (context,html,data) => {
    var htmlDom = html[0];
    if (htmlDom === undefined) return true;
    IncarnateGamingLLC.Reference.crossReferenceSetClick(htmlDom);
    IncarnateGamingLLC.Reference.populateSetClick(htmlDom);
    IncarnateGamingLLC.Reference.secretSetContext(html[0],context);
    IncarnateGamingLLC.Reference.rollMacroSetClick(htmlDom);
    html = $(htmlDom);
});
Hooks.on("renderActorSheet", (context,html,data) => {
    var htmlDom = html[0];
    if (htmlDom === undefined) return true;
    IncarnateGamingLLC.Reference.crossReferenceSetClick(htmlDom);
    IncarnateGamingLLC.Reference.populateSetClick(htmlDom);
    IncarnateGamingLLC.Reference.secretSetContext(html[0],context);
    IncarnateGamingLLC.Reference.rollMacroSetClick(htmlDom);
    html = $(htmlDom);
});
/*
Hooks.on("renderActorSheet5eNPC", (context,html,data) => {
	var htmlDom = html[0];
	if (htmlDom === undefined) return true;
	IncarnateGamingLLC.Reference.crossReferenceSetClick(htmlDom);
	IncarnateGamingLLC.Reference.populateSetClick(htmlDom);
	IncarnateGamingLLC.Reference.secretSetContext(html[0],context);
	IncarnateGamingLLC.Reference.rollMacroSetClick(htmlDom);
	html = $(htmlDom);
});
*/
Hooks.on("renderChatMessage", (context,messageData,html) => {
    var htmlDom = html[0];
    if (htmlDom === undefined) return true;
    IncarnateGamingLLC.Reference.crossReferenceSetClick(htmlDom);
    IncarnateGamingLLC.Reference.populateSetClick(htmlDom);
    IncarnateGamingLLC.Reference.rollMacroSetClick(htmlDom);
    html = $(htmlDom);
});
/*
 * Sets region folder to current one in settings
 * Allows region to not reset to first in list whenever a new GmsBlind is deployed
 */
Hooks.on("renderGmsBlind", (context, html, data) => {
    const currentRegion = game.settings.get("incarnateWorldBuilding","incRegions").currentRegion;
    var select = $(html)[0].getElementsByClassName("incarnate-journalListing")[0];
    var options = select.options;
    for (var option, a=0; option = options[a]; a++){
        if (option.value === currentRegion){
            select.selectedIndex = a;
            break;
        }
    }
});
//Adds a quest section to journal entries
Hooks.on("renderJournalSheet", async (context,html,entity) => {
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
    IncarnateGamingLLC.Reference.populateSetClick(htmlDom);
    IncarnateGamingLLC.Reference.crossReferenceSetClick(htmlDom);
    IncarnateGamingLLC.Reference.secretSetContext(htmlDom,context);
    IncarnateGamingLLC.Reference.rollMacroSetClick(htmlDom);
    html = $(htmlDom);
});
Hooks.on("preCreateChatMessage", (chatFunction,chatMessage) =>{
    if (chatMessage.content === undefined)return;
    if (chatMessage.content.match(/^\/help/) !== null){
        chatMessage.content += '<div><strong>Public Commands:</strong> /statRoll /statAuditMe /statAudit /parseActor /pA /parseJournal /pJ /parseItem /pI</div><div><strong>GM Commands:</strong> /gmscreen</div><div>See <span class="crossReference" data-fid="g7NQ9CEj2AiLpxXs" data-type="JournalEntry" data-parent="HlyV9728fyQUUdDx" data-pack="world.incarnateRules">Player Quick Sheet</span> for more details</div>';
        return true;
    }
    //Messages about stats
    else if (chatMessage.content.match(/^\/stat/i) !== null){
        if (chatMessage.content.match(/^\/statRoll/i) !== null){
            const statRoll = StatRoll.playerStatRoll(chatMessage.user);
            if (statRoll !== false){
                chatMessage.content = "<p>" + JSON.stringify(statRoll) + "</p>";
            }
        }else if (chatMessage.content.match(/^\/statAuditMe/i) !== null){
            const tempMessage = StatRoll.statAudit(game.users.get(chatMessage.user).data.name);
            if (tempMessage !== false){
                chatMessage.content = tempMessage;
            }
        }else if (chatMessage.content.match(/^\/statAudit/i) !== null){
            var tempMessage = false;
            if(game.user.isGM && chatMessage.content.match(/^\/statAuditHard/i) !== null){
                tempMessage = StatRoll.statAuditHard(chatMessage.content.substr(15));
            }else{
                tempMessage = StatRoll.statAudit(chatMessage.content.substr(11));
            }
            if (tempMessage !== false){
                chatMessage.content = tempMessage;
            }
        }
    }
    //TODO move all these 5eModule references to the 5e module
    //Creating Cross Reference links in chat and console
    else if (chatMessage.content.match(/^\/parse/) !== null){
        if (chatMessage.content.match(/^\/parseActor/i) !== null){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseActor(chatMessage.content.substr(12));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        } else if (chatMessage.content.match(/^\/parseJournal/i) !== null){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseJournal(chatMessage.content.substr(14));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        } else if (chatMessage.content.match(/^\/parseItem/i) !== null){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseItem(chatMessage.content.substr(11));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        }
    }else if (chatMessage.content.match(/^\/p/) !== null){
        if (chatMessage.content.match(/^\/pA/)){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseActor(chatMessage.content.substr(4));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        }else if (chatMessage.content.match(/^\/pI/)){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseItem(chatMessage.content.substr(4));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        }else if (chatMessage.content.match(/^\/pJ/)){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseJournal(chatMessage.content.substr(4));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        }
    }
    if (!game.user.isGM)return;
    if (chatMessage.content.match(/^\/gmscreen/i) !== null || chatMessage.content.match(/^\/gms/i) !== null){
        incarnateGMblind();
        return false;
    }
});
Hooks.on("preUpdateDrawing", async (sceneIn, drawingIn, drawingDelta) =>{
    const drawing = sceneIn;
    if (sceneIn === undefined || sceneIn.data === undefined || sceneIn.data.flags === undefined) return true;
    const scene = game.scenes.get(sceneIn._id);
    const sceneWalls = JSON.parse(JSON.stringify(scene.data.walls));
    let drawings = JSON.parse(JSON.stringify(scene.data.drawings));
    let walls = JSON.parse(JSON.stringify(scene.data.walls));
    let notes = JSON.parse(JSON.stringify(scene.data.notes));
    //const drawing = drawings.find(source => source.id === a.data.id);
    if (drawingIn.flags.type === "tree"){
        return IncarnateGamingLLC.ForestGenerator.moveTree(sceneIn, drawingDelta, sceneWalls, scene, drawing, drawings);
    }else if (drawingIn.flags.type === "room"|| drawingIn.flags.type ==="hall"){
        return IncarnateGamingLLC.DungeonGenerator.moveRoomHall(walls, drawings, notes, scene);
    }
});
Hooks.on("preCreateDrawing", async (drawingClass,sceneId,data) =>{
    if (data.flags === undefined) return true;
    if (data.flags.type === undefined) return true;
    if (data.flags.type === "tree"){
        const settings = game.settings.get("incarnate","incSceneGenSettings");
        const scene = game.scenes.get(sceneId)
        var drawings = JSON.parse(JSON.stringify(scene.data.drawings));
        var drawing = drawings.find(drawing=>drawing.id===data.id);
        var walls = JSON.parse(JSON.stringify(scene.data.walls));
        const width = data.width * settings.forest.trunkSize / 100;
        const height = data.height * settings.forest.trunkSize / 100;
        const x = data.x + ((data.width - width)/2);
        const y = data.y + ((data.height - height)/2);
        var id = 1;
        walls.forEach(wall =>{
            id = wall.id > id ? wall.id : id;
        });
        const rectangleWalls = IncarnateGamingLLC.SceneGen.rectangleWalls(x,y,width,height,id,undefined,undefined,{door:0,flags:{type:"tree"},move:1,sense:2});
        walls = walls.concat(rectangleWalls.walls);
        drawing.flags.walls =[];
        rectangleWalls.walls.forEach(wall =>{
            drawing.flags.walls.push(wall.id);
        });
        scene.update({walls:walls,drawings:drawings})
        return false;
    }
    return true;
});
Hooks.on("renderDrawingConfig", async (app,html,data) =>{
    if (data.object.flags === undefined) data.object.flags = {};
    const flagType = data.object.flags.type !== undefined ? data.object.flags.type : "";
    var windowClass = html[0];
    var nav = windowClass.getElementsByClassName("sheet-tabs")[0];
    const flagTab = document.createElement("a");
    flagTab.setAttribute("class","item");
    flagTab.setAttribute("data-tab","flags");
    flagTab.innerHTML = '<i class="fas fa-flag"> Flags</i>';
    nav.append(flagTab);
    var form = windowClass.getElementsByTagName("form")[0];
    const footer = form.getElementsByTagName("footer")[0];
    const flagContent = document.createElement("div");
    flagContent.setAttribute("class","tab");
    flagContent.setAttribute("data-tab","flags");
    flagContent.innerHTML =
        `<div class="form-group">
			<label for="flags.type">Type</label>
			<select name="flags.type" data-dtype="String">
				<option value=""${flagType===""?" selected":""}></option>
				<option value="hall"${flagType==="hall"?" selected":""}>Hall</option>
				<option value="room"${flagType==="room"?" selected":""}>Room</option>
				<option value="tree"${flagType==="tree"?" selected":""}>Tree</option>
			</select>
		</div>`;
    form.insertBefore(flagContent,footer);
});
Hooks.on("preUpdateNote", (note,sceneId,formData)=> {
    if (formData["flags.tempType"] === " " || formData["flags.template"] == "" || formData["flags.template"] == undefined) return;
    const sanName = IncarnateGamingLLC.Reference.sanitizeName(formData["flags.template"].split("__")[1]);
    formData["flags.templateName"] = sanName;
    formData["flags.template"] = formData["flags.template"].split("__")[0];
    console.log(formData);
});
Hooks.on("renderNoteConfig",(app,html,data) => {
    const htmlDom = html[0];
    if (htmlDom === undefined) return true;
    htmlDom.style.height="370px";
    const form = htmlDom.getElementsByTagName("form")[0];
    const tab1 = document.createElement("div");
    const submitButton = form.getElementsByTagName("button")[0];
    const clonedButton = submitButton.outerHTML;
    form.removeChild(submitButton);
    tab1.innerHTML = form.innerHTML;
    tab1.setAttribute("class","tab");
    tab1.setAttribute("data-tab","main");
    tab1.setAttribute("data-group","noteConfigTabs");
    form.innerHTML =
        `<nav class="tabs flex-auto" data-group="noteConfigTabs"> 
			<a class="item" data-tab="main" title="Main"><i class="fas fa-book"></i> Main</a>
			<a class="item" data-tab="flags" title="Flags"><i class="fas fa-flag"></i> Flags</a>
		</nav>` +
        tab1.outerHTML +
        `<div class="tab" data-tab="flags" data-group="noteConfigTabs">
			<div class="form-group">
				<label for="flags.tempType">Template Type</label>
				<select name="flags.tempType" class="templateType">
					<option value=" " selected></option>
					<option value="Dungeons">Dungeons</option>
					<option value="Districts">Districts</option>
					<option value="City">City</option>
					<option value="Buildings">Buildings</option>
					<option value="NPCs">NPCs</option>
					<option value="Miscellaneous">Miscellaneous</option>
				</select>
			</div>
			<div class="form-group">
				<label>Template</label>
				<select name="flags.template" class="templatePosition"></select>
			</div>
		</div>`;
    form.innerHTML += clonedButton;
    //listener to make main tabs work
    let nav = $('.tabs[data-group="noteConfigTabs"]');
    new Tabs(nav, {
        initial: "main",
        callback: t => console.log("Tab ${t} was clicked")
    });
    //listener for folder change
    let templateFolder = htmlDom.getElementsByClassName("templateType");
    [].forEach.call(templateFolder, folder =>{
        folder.addEventListener("change",GmsBlind.addDropDown)
    });
    if (data.object.flags !== undefined && data.object.flags.tempType !== undefined && data.object.flags.tempType != " "){
        var options = form.getElementsByClassName("templateType")[0].options;
        [].forEach.call(options, option=> {
            if (option.selected === true){
                option.removeAttribute("selected");
            }
            if (option.value === data.object.flags.tempType){
                option.setAttribute("selected","");
            }
        });
    }
    GmsBlind.addDropDown(undefined,form.getElementsByClassName("templateType")[0])
        .then(result =>{
            if (data.object.flags !== undefined && data.object.flags.template !== undefined && data.object.flags.template != ""){
                var options = htmlDom.getElementsByClassName("templatePosition")[0].options;
                [].forEach.call(options, option=> {
                    if (option.selected === true){
                        option.removeAttribute("selected");
                    }
                    if (option.value === data.object.flags.template){
                        option.setAttribute("selected","");
                    }
                });
            }
        });
});
Hooks.on("renderSceneConfig",(app,html,data) => {
    if (game.settings.get("incarnateWorldBuilding","sceneTabs")){
        IncarnateGamingLLC.SceneConfig.changeSceneConfig(app,html,data);
        return true;
    }else{
        return true;
    }
});
Hooks.on("incarnateNoteDoubleLeft",(ev,note)=>{
    console.log(ev,note);
    if (note.data !== undefined && note.data.flags !== undefined && note.data.flags.template !== undefined && note.data.flags.template !== "" && note.data.flags.tempType !== " "){
        const newContent = IncarnateGamingLLC.Reference.populateTemplateInsert(note.data.flags.template).then(newContent =>{
            if (newContent.resultType === "Actor"){
                const newToken = JSON.parse(JSON.stringify(newContent.result.data.token));
                newToken.x = note.data.x;
                newToken.y = note.data.y;
                const incToken = Token.create(note.scene.data._id,newToken);
                incToken.then(result => {
                    result.draw();
                    note.delete(note.scene.data._id);
                });
            }else if (newContent.resultType === "JournalEntry"){
                var noteData = JSON.parse(JSON.stringify(note.data));
                noteData.flags = {template:"",tempType:""};
                noteData.entryId = newContent.result.data._id;
                note.update(note.scene.data._id,noteData);
                note.draw();
                if(note.data.flags.tempType === "Dungeons"){
                    const advance = Hooks.callAll("incDungeonsRoomDescription",ev,note);
                }
            }
        });
        return false;
    }
});
Hooks.on("preUpdateActor",(actor,data)=>{
    if(game.settings.get("incarnateWorldBuilding","autoKill") === false) return true;
    if (data["data.attributes.hp.value"] === undefined) return true;
    const token = canvas.tokens.placeables.find(tok => tok.data.actorId === data._id);
    if (token !== undefined){
        IncarnateGamingLLC.AutoKill.autoKill(token,data,data["data.attributes.hp.value"]);
    }
    return true;
});
Hooks.on("preUpdateToken",(token,sceneId,data)=>{
    if (sceneId !== game.scenes.active.data._id) return true;
    if (data.actorData !== undefined && data.actorData["data.attributes.hp.value"] !== undefined){
        if(game.settings.get("incarnateWorldBuilding","autoKill")){
            const fullToken = canvas.tokens.get(token.id);
            IncarnateGamingLLC.AutoKill.autoKill(fullToken,data);
        }
    }
    return true;
});
