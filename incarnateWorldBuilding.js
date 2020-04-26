Hooks.on("init", async () => {
	IncarnateMainSettings.incarnateSetupDefaults();
});
Hooks.on('ready', async () =>  {
	if (game.settings.get("incarnateWorldBuilding","anvilButtons")){
		var anvil = document.getElementById("logo")
		if ( game.user.isGM ) {
			anvil.setAttribute("onclick","incarnateGMblind()");
		}else{
		}
		anvil.ondragover = ev => IncarnateAnvil.incarnateOnDragOver(event);
		anvil.ondrop = ev => IncarnateAnvil.incarnateOnDrop(event);
	}
	IncarnateCalendar.incarnateSetupCalendar();
	IncarnateStatRoll.incarnateSetupDefaults();
	IncarnateSceneGen.incarnateSetupDefaults();
	IncarnateWindowMemory.incarnateSetupDefaults();
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
	IncarnateReference.crossReferenceSetClick(htmlDom);
	IncarnateReference.populateSetClick(htmlDom);
	IncarnateReference.secretSetContext(html[0],context);
	IncarnateReference.rollMacroSetClick(htmlDom);
	html = $(htmlDom);
});
Hooks.on("renderActorSheet", (context,html,data) => {
	var htmlDom = html[0];
	if (htmlDom === undefined) return true;
	IncarnateReference.crossReferenceSetClick(htmlDom);
	IncarnateReference.populateSetClick(htmlDom);
	IncarnateReference.secretSetContext(html[0],context);
	IncarnateReference.rollMacroSetClick(htmlDom);
	html = $(htmlDom);
});
/*
Hooks.on("renderActorSheet5eNPC", (context,html,data) => {
	var htmlDom = html[0];
	if (htmlDom === undefined) return true;
	Reference.crossReferenceSetClick(htmlDom);
	Reference.populateSetClick(htmlDom);
	Reference.secretSetContext(html[0],context);
	Reference.rollMacroSetClick(htmlDom);
	html = $(htmlDom);
});
*/
Hooks.on("renderChatMessage", (context,messageData,html) => {
	var htmlDom = html[0];
	if (htmlDom === undefined) return true;
	IncarnateReference.crossReferenceSetClick(htmlDom);
	IncarnateReference.populateSetClick(htmlDom);
	IncarnateReference.rollMacroSetClick(htmlDom);
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
		questAddQuest.addEventListener("click",IncarnateJournalEntry.newQuest);
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
								var questEditor = new IncarnateQuestEditor(journal,Number(IncarnateReference.getClosestClass(event.srcElement,"quest-control").getAttribute("data-number")));
								questEditor.render(true);
							});
							questTitle.append(questEdit);
							var questDelete = document.createElement("a");
							questDelete.setAttribute("class","quest-control quest-delete");
							questDelete.setAttribute("title","Delete Quest");
							questDelete.innerHTML = '<i class="fas fa-trash"/>';
							questDelete.addEventListener("click",event => {
								var quests = JSON.parse(JSON.stringify(journal.flags.quests));
								quests.splice(Number(IncarnateReference.getClosestClass(event.srcElement,"quest-control").getAttribute("data-number")),1);
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
	IncarnateReference.populateSetClick(htmlDom);
	IncarnateReference.crossReferenceSetClick(htmlDom);
	IncarnateReference.secretSetContext(htmlDom,context);
	IncarnateReference.rollMacroSetClick(htmlDom);
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
			const statRoll = IncarnateStatRoll.playerStatRoll(chatMessage.user);
			if (statRoll !== false){
				chatMessage.content = "<p>" + JSON.stringify(statRoll) + "</p>";
			}
		}else if (chatMessage.content.match(/^\/statAuditMe/i) !== null){
			const tempMessage = IncarnateStatRoll.statAudit(game.users.get(chatMessage.user).data.name);
			if (tempMessage !== false){
				chatMessage.content = tempMessage;
			}
		}else if (chatMessage.content.match(/^\/statAudit/i) !== null){
			var tempMessage = false;
			if(game.user.isGM && chatMessage.content.match(/^\/statAuditHard/i) !== null){
				tempMessage = IncarnateStatRoll.statAuditHard(chatMessage.content.substr(15));
			}else{
				tempMessage = IncarnateStatRoll.statAudit(chatMessage.content.substr(11));
			}
			if (tempMessage !== false){
				chatMessage.content = tempMessage;
			}
		}
	}
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
Hooks.on("preUpdateDrawing", async (a,b,c) =>{
	const drawing = a, sceneId = b, changes = c;
	if (a === undefined) return true;
	if (a.data === undefined) return true;
	if (a.data.flags === undefined) return true;
	const scene = game.scenes.get(b);
	const sceneWalls = JSON.parse(JSON.stringify(scene.data.walls));
	var drawings = JSON.parse(JSON.stringify(scene.data.drawings));
	var walls = JSON.parse(JSON.stringify(scene.data.walls));
	var notes = JSON.parse(JSON.stringify(scene.data.notes));
	//const drawing = drawings.find(source => source.id === a.data.id);
	if (a.data.flags.type === "tree"){
		if (a.data.flags.walls === undefined) return true;
		for (var object in c){
			drawing[object] = c[object];
		}
		const boundWalls = a.data.flags.walls;
		if (a.data.flags.regular === true){
			boundWalls.forEach(wall => {
				const activeWall = sceneWalls.find(sceneWall => sceneWall.id === wall);
				var startingX = a.data.x;
				var startingY = a.data.y;
				if (c.x !== undefined){
					const cLength = activeWall.c.length;
					for (var d=0; d<cLength; d+=2){
						activeWall.c[d] = Math.floor(Math.floor(activeWall.c[d]) - Math.floor(a.data.x) + Math.floor(c.x));
					}
					startingX = c.x;
				}
				if (c.y !== undefined){
					const cLength = activeWall.c.length;
					for (var d=1; d<cLength; d+=2){
						activeWall.c[d] = Math.floor( Math.floor(activeWall.c[d]) - Math.floor(a.data.y) + Math.floor(c.y));
					}
					startingY = c.y;
				}
				if (c.width !== undefined){
					const cLength = activeWall.c.length;
					const widthChange = Math.floor(c.width) / Math.floor(a.data.width);
					console.log(widthChange);
					for (var d=0; d<cLength; d+=2){
						console.log(activeWall.c[d]);
						activeWall.c[d] = ((activeWall.c[d] - startingX) * widthChange) + startingX;
						console.log(activeWall.c[d])
					}
				}
				if (c.height !== undefined){
					const cLength = activeWall.c.length;
					const heightChange = Math.floor(c.height) / Math.floor(a.data.height);
					console.log(heightChange);
					for (var d=1; d<cLength; d+=2){
						console.log(activeWall.c[d])
						activeWall.c[d] = ((activeWall.c[d] - startingY) * heightChange) + startingY;
						console.log(activeWall.c[d])
					}
				}
			});
		}
		drawing.locked=false;
		scene.update({walls:sceneWalls,drawings:drawings});
		return false;
	}else if (a.data.flags.type === "room"|| a.data.flags.type ==="hall"){
		const updateWalls = new Promise(async (resolve,reject) =>{
			await IncarnateReference.incarnateDelay(300);
			walls = JSON.parse(JSON.stringify(scene.data.walls));
			drawings = JSON.parse(JSON.stringify(scene.data.drawings));
			const dungeonWalls = await IncarnateSceneGen.dungeonWalls(drawings);
			walls = dungeonWalls.walls;
			if (scene.data.flags !== undefined && scene.data.flags.dungeon !== undefined && scene.data.flags.dungeon.traceWalls === true){
				const dungeonTraceWalls = await IncarnateSceneGen.dungeonTraceWalls(walls,drawings);
				walls = dungeonTraceWalls.walls;
				drawings = dungeonTraceWalls.drawings;
			}else{
				drawings = drawings.filter(drawing => drawing.flags === undefined || drawing.flags.type === undefined || drawing.flags.type !== "wall");
			}
			if (scene.data.flags !== undefined && scene.data.flags.dungeon !== undefined && scene.data.flags.dungeon.roomDesc === true){
				const dungeonRoomDesc = await IncarnateSceneGen.dungeonRoomDesc(drawings,notes);
				drawings = dungeonRoomDesc.drawings;
				notes = dungeonRoomDesc.notes;
			}
			scene.update({drawings:drawings,notes:notes,walls:walls});
		});
		updateWalls;
		return true;
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
		const rectangleWalls = IncarnateSceneGen.rectangleWalls(x,y,width,height,id,undefined,undefined,{door:0,flags:{type:"tree"},move:1,sense:2});
		walls = walls.concat(rectangleWalls.walls);
		drawing.flags.walls =[];
		rectangleWalls.walls.forEach(wall =>{
			drawing.flags.walls.push(wall.id);
		});
		scene.update({walls:walls,drawings:drawings})
		return false;
	}
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
	const sanName = IncarnateReference.sanitizeName(formData["flags.template"].split("__")[1]);
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
Hooks.on("renderSceneSheet",(app,html,data) => {
	if (game.settings.get("incarnateWorldBuilding","sceneTabs")){
		IncarnateSceneConfig.changeSceneConfig(app,html,data);
		return true;
	}else{
		return true;
	}
});
Hooks.on("incarnateNoteDoubleLeft",(ev,note)=>{
	console.log(ev,note);
	if (note.data !== undefined && note.data.flags !== undefined && note.data.flags.template !== undefined && note.data.flags.template !== "" && note.data.flags.tempType !== " "){
		const newContent = IncarnateReference.populateTemplateInsert(note.data.flags.template).then(newContent =>{
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
		IncarnateAutoKill.autoKill(token,data,data["data.attributes.hp.value"]);
	}
	return true;
});
Hooks.on("preUpdateToken",(token,sceneId,data)=>{
	if (sceneId !== game.scenes.active.data._id) return true;
	if (data.actorData !== undefined && data.actorData["data.attributes.hp.value"] !== undefined){
		if(game.settings.get("incarnateWorldBuilding","autoKill")){
			const fullToken = canvas.tokens.get(token.id);
			IncarnateAutoKill.autoKill(fullToken,data);
		}
	}
	return true;
});
/**
* Anvil Button Actions
*/
//Dropping on anvil feeds data to console
class IncarnateAnvil{
	static incarnateOnDragOver(event) {
		event.preventDefault();
		return false;
	}
	static incarnateOnDrop(event) {
		console.log(event,event.dataTransfer.getData('text/plain'));
		event.preventDefault();
		// Try to extract the data
		let data;
		console.log(IncarnateReference.incarnateJSONcheck(event.dataTransfer.getData("text/plain")));
		data = JSON.parse(event.dataTransfer.getData('text/plain'));
		console.log("data",data);
	}
}
class IncarnateCalendar{
	/**
	* Calendar Prep
	*/
	static incarnateSetupCalendar (){
		game.settings.register("incarnate","incCalendar", {
			name: "Calendar",
			hint: "Tracks game time",
			default: "",
			type: Object,
			scope: 'world',
			onChange: settings => {
				console.log(settings);
			}
		});
		if( game.settings.get("incarnate","incCalendar") !=""){
			return(game.settings.get("incarnate","incCalendar"));
		}else {
			console.log("Creating Calendar Settings");
			var tempCalendar = {
				"date":{
					"y":1,
					"m":1,
					"d":1,
					"h":0,
					"i":0,
					"s":0
				},
				"maxes":{
					"m":12,
					"d":30,
					"h":23,
					"i":59,
					"s":59
				},
				"monthNames":["Zota","Maco","Nita","Ridon","Dankil","Maso","Drite","Fami","Notrae","Tali","Alo","Sadil"]
			}
			game.settings.set("incarnate","incCalendar",tempCalendar);
			return(tempCalendar);
		}
	}
	static yearChange(delta,calendar){
		if (calendar === undefined){
			calendar = game.settings.get("incarnate","incCalendar");
		}
		calendar.date.y = calendar.date.y+delta;
		game.settings.set("incarnate","incCalendar",calendar);
	}
	static monthChange(delta,calendar){
		if (calendar === undefined){
			calendar = game.settings.get("incarnate","incCalendar");
		}
		calendar.date.m = calendar.date.m+delta;
		if (calendar.date.m > calendar.maxes.m){
			var change = Math.floor(calendar.date.m/calendar.maxes.m);
			calendar.date.m %= calendar.maxes.m;
			IncarnateCalendar.yearChange(change,calendar);
		}else if (calendar.date.m <1){
			var change = Math.ceil(Math.abs(calendar.date.m)/calendar.maxes.m);
			calendar.date.m = calendar.date.m+change*calendar.maxes.m;
			IncarnateCalendar.yearChange(-change,calendar);
		}else{
			game.settings.set("incarnate","incCalendar",calendar);
		}
	}
	static dayChange(delta,calendar){
		if (calendar === undefined){
			calendar = game.settings.get("incarnate","incCalendar");
		}
		calendar.date.d = calendar.date.d+delta;
		if (calendar.date.d > calendar.maxes.d){
			var change = Math.floor(calendar.date.d / calendar.maxes.d);
			calendar.date.d = calendar.date.d%calendar.maxes.d;
			IncarnateCalendar.monthChange(change,calendar);
		}else if (calendar.date.d <1){
			var change = Math.ceil(Math.abs(calendar.date.d)/calendar.maxes.d);
			calendar.date.d = calendar.date.d+change*calendar.maxes.d;
			IncarnateCalendar.monthChange(-change,calendar);
		}else{
			game.settings.set("incarnate","incCalendar",calendar);
		}
	}
	static hourChange(delta,calendar){
		if (calendar === undefined){
			calendar = game.settings.get("incarnate","incCalendar");
		}
		calendar.date.h = calendar.date.h+delta;
		if (calendar.date.h > calendar.maxes.h){
			var change = Math.floor(calendar.date.h / calendar.maxes.h);
			calendar.date.h = calendar.date.h % calendar.maxes.h;
			IncarnateCalendar.dayChange(change,calendar);
		}else if (calendar.date.h <0){
			var change = Math.ceil(Math.abs(calendar.date.h)/calendar.maxes.h);
			calendar.date.h = calendar.date.h+change*calendar.maxes.h;
			IncarnateCalendar.dayChange(-change,calendar);
		}else{
			game.settings.set("incarnate","incCalendar",calendar);
		}
	}
	static minuteChange(delta,calendar){
		if (calendar === undefined){
			calendar = game.settings.get("incarnate","incCalendar");
		}
		calendar.date.i = calendar.date.i+delta;
		if (calendar.date.i > calendar.maxes.i){
			var change = Math.floor(calendar.date.i / calendar.maxes.i)
			calendar.date.i = calendar.date.i%calendar.maxes.i;
			IncarnateCalendar.hourChange(change,calendar);
		}else if (calendar.date.i <0){
			var change = Math.ceil(Math.abs(calendar.date.i)/calendar.maxes.i);
			calendar.date.i = calendar.date.i+change*calendar.maxes.i;
			IncarnateCalendar.hourChange(-change,calendar);
		}else{
			game.settings.set("incarnate","incCalendar",calendar);
		}
	}
	static secondChange(delta,calendar){
		if (calendar === undefined){
			calendar = game.settings.get("incarnate","incCalendar");
		}
		calendar.date.s = calendar.date.s+delta;
		if (calendar.date.s > calendar.maxes.s){
			var change = Math.floor(calendar.date.s/calendar.maxes.s);
			calendar.date.s = calendar.date.s % calendar.maxes.s;
			IncarnateCalendar.minuteChange(change,calendar);
		}else if (calendar.date.s <0){
			var change = Math.ceil(Math.abs(calendar.date.s)/calendar.maxes.s)
			calendar.date.s = calendar.date.s+change*calendar.maxes.s;
			IncarnateCalendar.minuteChange(-change,calendar);
		}else{
			game.settings.set("incarnate","incCalendar",calendar);
		}
	}
	static incarnateDate(){
		var calendar = game.settings.get("incarnate","incCalendar");
		calendar = calendar.date;
		return calendar.y + "_" + calendar.m + "_"+calendar.d+"_"+calendar.h+"_"+calendar.i+"_"+calendar.s;
	}
	static getYear(date){
		const parts = date.split("_");
		return Number(parts[0]);
	}
	static getMonth(date){
		const parts = date.split("_");
		return Number(parts[0])*12 + Number(parts[1]);
	}
	static getDay(date){
		const parts = date.split("_");
		return Number(parts[0])*12*30 + Number(parts[1])*30 + Number(parts[2]);
	}
	static getHour(date){
		const parts = date.split("_");
		return Number(parts[0])*12*30*24 + Number(parts[1])*30*24 + Number(parts[2])*24 + Number(parts[3]);
	}
	static getMinute(date){
		const parts = date.split("_");
		return Number(parts[0])*12*30*24*60 + Number(parts[1])*30*24*60 + Number(parts[2])*24*60 + Number(parts[3])*60 + Number(parts[4]);
	}
	static getSecond(date){
		const parts = date.split("_");
		return Number(parts[0])*12*30*24*60*60 + Number(parts[1])*30*24*60*60 + Number(parts[2])*24*60*60 + Number(parts[3])*60*60 + Number(parts[4])*60 + Number(parts[5]);
	}
	static toDateString(date){
		const parts = date.split("_");
		const year = Number(parts[0])<10 ? "000" + parts[0]:
			Number(parts[0])<100 ? "00" + parts[0]:
			Number(parts[0])<1000 ? "0" + parts[0]: parts[0];
		const month = game.settings.get("incarnate","incCalendar").monthNames[Number(parts[1])-1];
		const day = Number(parts[2])<10 ? "0"+parts[2] : parts[2];
		console.log(year,month,day);
		return month.substr(0,3) + " " + day + " " + year;
	}
}
/**
* Cross Reference
*/
class IncarnateReference{
	static async lookupActorComplete(_id,pack,packContent){
		var result = await this.lookupLocalActorByOrigin(_id);
		if (result[0]!==false) {return result}; 
		result = await this.lookupPackEntityByOrigin(_id,pack,packContent);
		if (result[0]!==false) {return result};
		result = await this.lookupLocalActorById(_id);
		if (result[0]!==false) {return result};
		result = await this.lookupPackEntityById(_id,pack);
		if (result[0]!==false) {return result};
		return [false];
	}
	static lookupLocalActorByOrigin(originID){
		const actors = game.actors.entities;
		const actorLen = actors.length;
		for (var z=0; z<actorLen; z++){
			if (actors[z].data.flags.origin!==undefined){
				if(actors[z].data.flags.origin._id===originID){
					return [actors[z]];
				}
			}
		}
		return [false];
	}
	static lookupLocalActorById(_id){
		const actor = game.actors.get(_id);
		if (actor !== undefined){
			return [actor];
		}
		return [false];
	}
	static async lookupItemComplete(_id,pack,packContent){
		var result = await this.lookupLocalItemByOrigin(_id);
		if (result[0]!==false) {return result}; 
		result = await this.lookupPackEntityByOrigin(_id,pack,packContent);
		if (result[0]!==false) {return result};
		result = await this.lookupLocalItemById(_id);
		if (result[0]!==false) {return result};
		result = await this.lookupPackEntityById(_id,pack);
		if (result[0]!==false) {return result};
		return [false];
	}
	static lookupLocalItemByOrigin(originID){
		const items = game.items.entities;
		const itemLen = items.length;
		for (var z=0; z<itemLen; z++){
			if (items[z].data.flags.origin!==undefined){
				if(items[z].data.flags.origin._id===originID){
					return [items[z]];
				}
			}
		}
		return [false];
	}
	static lookupLocalItemById(_id){
		const item = game.items.get(_id);
		if (item !== undefined){
			return [item];
		}
		return [false];
	}
	static async lookupJournalComplete(_id,pack,packContent){
		var result = await this.lookupLocalJournalByOrigin(_id);
		if (result[0]!==false) {return result}; 
		result = await this.lookupPackEntityByOrigin(_id,pack,packContent);
		if (result[0]!==false) {return result};
		result = await this.lookupLocalJournalById(_id);
		if (result[0]!==false) {return result};
		result = await this.lookupPackEntityById(_id,pack);
		if (result[0]!==false) {return result};
		return [false];
	}
	static lookupLocalJournalByOrigin(originID){
		const journals = game.journal.entities;
		const journalLen = journals.length;
		for (var z=0; z<journalLen; z++){
			if (journals[z].data.flags.origin!==undefined){
				if(journals[z].data.flags.origin._id===originID){
					return [journals[z]];
				}
			}
		}
		return [false];
	}
	static lookupLocalJournalById(_id){
		const journalEntry = game.journal.get(_id);
		if (journalEntry !== undefined){
			return [journalEntry];
		}
		return [false];
	}
	static async lookupPackEntityByOrigin(originID,pack,packContent){
		if (pack == null)return false;
		//console.log("originID",originID,"pack",pack,"packContent",packContent);
		if (packContent === undefined){
			if (pack==""){return [false]};
			const packFound = this.incarnatePackFind(pack);
			if (packFound===undefined){console.warn("Pack: ",pack," not found");return [false]};
			packContent = await packFound.getContent();
		}
		const packContentLen = packContent.length;
		for (var z=0; z<packContentLen; z++){
			if (packContent[z].data.flags.origin!==undefined){
				if (packContent[z].data.flags.origin._id===originID){
					const sheet = [packContent[z],pack];
					return sheet;
				}
			}
		}
		return [false];
	}
	static async lookupPackEntityById(_id,pack){
		const packFound = this.incarnatePackFind(pack);
		if (packFound===[false]){return [false]};
		const tempItem = await packFound.getEntity(_id);
		const sheet = [tempItem,pack]
		return sheet;
	}
	static rollMacroSetup(html){
		html.innerHTML = html.innerHTML.replace(/@Roll\[(([ \+-]*([0-9]+)?[dD]([0-9fF]+)([a-z][a-z0-9<=>]+)?)+([ \+-]*[0-9]+)*)+\]/g, function (x) {
			x = x.replace(/@Roll\[/g,'<a class="incRollMacro"><i class="fas fa-dice"></i> ');
			x = x.replace(/\]/g,'</a>');
			return x;
		});
		return html;
	}
	static rollMacroSetClick(html){
		const rollNodes = html.getElementsByClassName("incRollMacro");
		[].forEach.call(rollNodes,node =>{
			node.addEventListener("click",IncarnateReference.rollMacroClick);
		});
		return html;
	}
	static rollMacroClick(ev){
		var element = IncarnateReference.getClosestClass(ev.srcElement,"incRollMacro");
		var temporaryRoll = new Roll(element.textContent);
		temporaryRoll.toMessage();
	}
	static secretSetContext(html,context){
		const secretNodes = html.getElementsByClassName("secret");
		const entryOptions = [
			{
				name:" Reveal/Hide",
				icon: '<i class="fas fa-comment-dots"/>',
				callback:secret => IncarnateReference.secretReveal(secret,context),
				condition: game.user.isGM
			}
		];
		Hooks.call(`getSecretContext`, $(html), entryOptions);
		//Currently the default ContextMenu function creates an error by applying a new listener each time the entity is saved and refreshed. You can either fix that with your JQuery or use me re-write below. Of note, the "getClosestClass" is a function that walks up the chain until it gets to an element with the assigned class, similar to the JQuery path you use.
		//new ContextMenu($(html),".secret",entryOptions);
		var dropDown = document.createElement("nav");
		dropDown.id="context-menu";
		var ol = document.createElement("ol");
		ol.classList.add("context-items");
		entryOptions.forEach(option =>{
			let display = true;
			if (option.condition !== undefined){
				display = (option.condition instanceof Function) ? option.condition() : option.condition;
			}
			if (display) {
				var li = document.createElement("li");
				li.innerHTML = option.icon + option.name;
				li.classList.add("context-item");
				li.addEventListener("click", inc => {
					var secret = IncarnateReference.getClosestClass(inc.srcElement,"secret");
					option.callback(secret,context);
					var navNode = secret.getElementsByTagName("nav");
					if (navNode.length > 0){
						navNode[0].remove();
					}
				});
				ol.append(li);
			}
		});
		dropDown.append(ol);
		[].forEach.call(secretNodes, node=> {
			node.addEventListener("contextmenu", context =>{
				var secret = IncarnateReference.getClosestClass(context.srcElement,"secret");
				var navNode = secret.getElementsByTagName("nav");
				if (navNode.length === 0){
					secret.append(dropDown);
					secret.style="position:relative";
				}else{
					navNode[0].remove();
				}
			});
		});
	}
	static async secretReveal(secret,context){
		//secret = secret[0];
		const navElement = secret.getElementsByTagName("nav");
		[].forEach.call(navElement, nav =>{
			nav.parentElement.removeChild(nav);
		});
		if (secret.classList.value.match(/learned/) !== null){
			secret.classList.remove("learned");
		}else{
			secret.classList.add("learned");
			ChatMessage.create({
				user:game.userId,
				content:secret.innerHTML,
				type:1
			},{});
		}	
		const editorContent = IncarnateReference.getClosestClass(secret,"editor-content");
		console.log(editorContent,context);
		context.object.update({[editorContent.getAttribute("data-edit")]:editorContent.innerHTML});
		await IncarnateReference.incarnateDelay(500);
		context.object.render(false);
	}
	static enrichHTML (content, {secrets=false, entities=true, links=true}={}) {
		let html = document.createElement("div");
		html.innerHTML = content;

		// Strip secrets
		if ( !secrets ) {
			let elements = html.querySelectorAll("section.secret");
			elements.forEach(e =>{
				console.log(e);
				if (e.classList.value.match(/learned/) === null){
					e.parentNode.removeChild(e);
				}
			});
		}

		// Match entities
		if ( entities ) {
			let rgx = /@(Actor|Item|JournalEntry|Scene)\[([^\]]+)\]/g;
			html.innerHTML = html.innerHTML.replace(rgx, _replaceEntity);
			html = IncarnateReference.rollMacroSetup(html);
		}

		// Replace hyperlinks
		if ( links ) {
			let rgx = /(?:[^\S]|^)((?:(?:https?:\/\/)|(?:www\.))(?:\S+))/gi;
			html.innerHTML = html.innerHTML.replace(rgx, _replaceHyperlinks);
		}

		return html.innerHTML;
	};
	static crossReferenceSetClick(node){
		const crossReferences = node.getElementsByClassName("crossReference");
		const crossRefLen = crossReferences.length;
		for (var a = 0; a<crossRefLen; a++){
			crossReferences[a].addEventListener("click",IncarnateReference.crossReferenceClick);
			if (crossReferences[a].draggable === true){
				crossReferences[a].addEventListener("dragstart",IncarnateReference.crossReferenceDragStart);
			}
		}
	}
	static crossReferenceClick(ev) {
		//console.log("I've been clicked!!",ev);
		var optionalPack = ev.currentTarget.getAttribute("data-pack");
		if (optionalPack === ""){optionalPack = null};
		var optionalParent = ev.currentTarget.getAttribute("data-parent");
		if (optionalParent === ""){optionalParent = null};
		//console.log(ev.currentTarget);//,optionalPack,optionalParent
		IncarnateReference.crossReference(ev.currentTarget.getAttribute("data-fid"),ev.currentTarget.getAttribute("data-type"),optionalPack,optionalParent);
	}
	static crossReferenceDragStart(ev){
		if (ev.srcElement.getAttribute("data-pack")!== undefined && ev.srcElement.getAttribute("data-pack")!== null){
			if(ev.srcElement.getAttribute("data-pack").match(/ItemPacks/i) !== null){
				var dragField = {
					type:"itemPack",
					pack:ev.srcElement.getAttribute("data-pack"),
					id:ev.srcElement.getAttribute("data-fid")
				}
			}else{
				var dragField = {
					type:ev.srcElement.getAttribute("data-type"),
					pack:ev.srcElement.getAttribute("data-pack"),
					id:ev.srcElement.getAttribute("data-fid")
				}
			}
		}else{
			var dragField = {
				type:ev.srcElement.getAttribute("data-type"),
				id:ev.srcElement.getAttribute("data-fid")
			}
		}
		event.dataTransfer.setData("text/plain",JSON.stringify(dragField));
	}
	static incarnateJSONcheck(input){
		if (input.match(/^{\"type\":\"Item\",\"id\":\"[a-zA-Z0-9]{16}\"}$/)!==null){
			return true;
		}else if (input.match(/^\[?\{\"type\":\"Item\",\"pack\":\"\w+\.\w+",\"id\":\"[a-zA-Z0-9]{16}\"\}(,\{\"type\":\"Item\",\"pack\":\"\w+\.\w+",\"id\":\"[a-zA-Z0-9]{16}\"\})*]?$/)!== null){
			return true;
		}else if (input.match(/^\{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"id\":[0-9]+}$/)!==null){
			return true;
		}else if (input.match(/^\{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\"\"pack\":\"\",\"id\":[0-9]+}$/)!==null){
			return true;
		}else if (input.match(/^\[{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"pack\":\"\",\"id\":[0-9]+}(,{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"pack\":\"\",\"id\":[0-9]+})*\]$/)!==null){
			return true;
		}else if (input.match(/^\[{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"pack\":\"\w+\.\w+\",\"id\":[0-9]+}(,{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"pack\":\"\w+\.\w+\",\"id\":[0-9]+})*\]$/)!==null){
			return true;
		}else if (input.match(/^{\"type\":\"itemPack\",\"pack\":\"\w+\.\w+\",\"id\":\"[a-zA-Z0-9]{16}\"}$/)!==null){
			return true;
		}else if (input.match(/^{\"type\":\"itemPack\",\"pack\":\"\",\"id\":\"[a-zA-Z0-9]{16}\"}$/)!==null){
			return true;
		}
		console.log("Not an item: ",input);
		return false;
	}
	static incarnateDelay(ms){
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	static incarnateDelayNonAsync(ms){
		//Try to NEVER use this. It is a busy wait and therefore very very painful.
		const date = Date.now();
		const targetDate = date + ms;
		var curDate = null;
		do{
			curDate = Date.now();
		}while (curDate < targetDate);
		return "finished";
	}
	static async onDragStart(ev){
		if (ev.target.getAttribute("data-type")==="Item"){
			const dragItem = {
				type: ev.target.getAttribute("data-type"),
				pack: ev.target.getAttribute("data-pack"),
				id: ev.target.getAttribute("data-fid")
			};
			ev.dataTransfer.setData("text/plain", JSON.stringify(dragItem));
			return dragItem;
		}else if(ev.target.getAttribute("data-type")==="Actor"){
			const packName = ev.srcElement.getAttribute("data-pack");
			if(packName.search("ItemPacks")!==-1){
				const dragItem = {
					type: "itemPack", 
					pack: ev.srcElement.getAttribute("data-pack"),
					id: ev.srcElement.getAttribute("data-fid")
				}				
				ev.dataTransfer.setData("text/plain", JSON.stringify(dragItem));
			}
		}else{
			console.log("Error 9772: Non Items not yet draggable");
		}
	}
	static async crossReference(fid,type,pack,fidParent){
		console.log("crossReference Start: ","fid",fid,"type",type,"pack",pack,"fidParent",fidParent);
		if(fidParent!=null){
			var fidChild = fid;
			fid = fidParent;
		}
		var entry = undefined;
		var packFound;
		if (type === "Item"){
			entry = await IncarnateReference.lookupLocalItemByOrigin(fid);
			if (entry[0] === false){
				entry = await IncarnateReference.lookupLocalItemById(fid);
			}
			entry = entry[0];
		} else if (type === "Table"){
			console.log("Tables not yet supported");
			return 0;
		} else if (type === "JournalEntry"){
			entry = await IncarnateReference.lookupLocalJournalByOrigin(fid);
			if (entry[0] === false){
				entry = await IncarnateReference.lookupLocalJournalById(fid);
			}
			entry = entry[0];
		} else if (type === "Encounter"){
			console.log("Encounters not yet supported");
			return 0;
		} else if (type === "internalReference"){
			IncarnateReference.crossReferenceInternalReference(fid);
			return 0;
		} else if (type === "Actor"){
			entry = await IncarnateReference.lookupLocalActorByOrigin(fid);
			if (entry[0] === false){
				entry = await IncarnateReference.lookupLocalActorById(fid);
			}
			entry = entry[0];
		}
		if (entry === false){//check compendium for id
			entry = await IncarnateReference.lookupPackEntityByOrigin(fid,pack);
			if (entry[0] === false){
				entry = await IncarnateReference.lookupPackEntityById(fid);
			}
			entry = entry[0];
		}
		if (entry === false || entry === undefined){
			console.warn("No match found for id: ",fid);
			return false;
		}
		if (!entry.visible){
			//if (!entry.data.permission.default > 0 || entry.data.permission[game.userId] > 0){
				console.log("Access denied to: ",entry.data.name);
				return;
			//}
		}
		console.log(entry);
		entry.sheet.render(true);
		await IncarnateReference.incarnateDelay(300);
		if (fidChild!=null){
			document.getElementById(fidChild).scrollIntoView(false,{block:"center",inline:"center"});
		}
		return 0;
	}
	static crossReferenceInternalEquipment(values){
		if (ui._incarnateEquipmentBrowser === undefined){
			ui._incarnateEquipmentBrowser = new IncarnateEquipmentBrowser(IncarnateReference.incarnatePackFind("world.incarnateEquipment").metadata);
		}
		ui._incarnateEquipmentBrowser.values = values;
		ui._incarnateEquipmentBrowser.render(true);
	}
	static crossReferenceInternalSpells(values){
		if (ui._incarnateSpellBrowser === undefined){
			ui._incarnateSpellBrowser = new IncarnateSpellBrowser(IncarnateReference.incarnatePackFind("world.incarnateSpells").metadata);
		}
		ui._incarnateSpellBrowser.values = values;
		ui._incarnateSpellBrowser.render(true);
	}
	static crossReferenceInternalReference(fid){
		if (fid === "KtzfRQAq8T3SPyDW"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroType:["Weapon"]});
		}else if (fid === "KvEKbUCQMZ5rUcBW"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Simple Melee Weapon"]});
		}else if (fid === "KvJQYEd9DkAbbEWb"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Simple Ranged Weapon"]});
		}else if (fid === "KwP04BSZd05sROpc"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Martial Melee Weapon"]});
		}else if (fid === "KwQRqynnMUUNEz1o"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Martial Ranged Weapon"]});
		}else if (fid === "Kx3SHGFAPsAubEnQ"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Improvised Weapon"]});
		}else if (fid === "KyjwZg4XrojEv1An"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroType:["Armor"]});
		}else if (fid === "Kyt1LKZ4goYufXjx"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Light Armor"]});
		}else if (fid === "KzNG5R0GbxqxgsJd"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Medium Armor"]});
		}else if (fid === "KzS6trWu7IhhDvRO"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Heavy Armor"]});
		}else if (fid === "L0cSX2XngITYvVk7"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Shield"]});
		}else if (fid === "LZDgMApt1P9oVCxi"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroType:["Adventuring Gear"]});
		}else if (fid === "LDCJMhc8KNfcdeWG"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Ammunition"]});
		}else if (fid === "LEUQ02SM10vGG1sF"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Alcohol"]});
		}else if (fid === "LG4UNtR1tkdIBbPj"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Arcane Focus"]});
		}else if (fid === "LHHZSYzjuChDkqTM"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Artisan's Tool"]});
		}else if (fid === "LHLkM5LDN7y20mql"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Book"]});
		}else if (fid === "LHpQDDOUVIB6EPug"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Container"]});
		}else if (fid === "LI75zCRLm7RJsbf5"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Cosmetic"]});
		}else if (fid === "LIDOgFwUaQ7UFVRj"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Druidic Focus"]});
		}else if (fid === "LP0IhtTNvdo6xono"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Equipment Kits"]});
		}else if (fid === "LPIDIsTLX4MrAISB"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Spoof"]});
		}else if (fid === "LPXwoZlzmXcvY70R"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Gaming Set"]});
		}else if (fid === "LPv56DsP7aEScLS8"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Holy Symbol"]});
		}else if (fid === "LREJCwm149LANLE2"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Land Vehicle"]});
		}else if (fid === "LS6IWOQcNqRcAl0a"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Musical Instrument"]});
		}else if (fid === "LV9cTD6dviatjI10"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Pet"]});
		}else if (fid === "LVr5gQxGYFhtVvTj"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Poisons"]});
		}else if (fid === "LWJHdyfBULNZuUXD"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Standard"]});
		}else if (fid === "LWNts0ZYUVZle4iC"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Poisons"]});
		}else if (fid === "LYaKMxiQGnOLZyFK"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Tool"]});
		}else if (fid === "LeNU6Gwk2NJBzMnG"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Waterborne Vehicle"]});
		}else if (fid === "LZYNX77ATgifJ9aa"){
			IncarnateReference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Mount"]});
		}else if (fid === "KpUWHS10UWD9nCS9"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Bard"]});
		}else if (fid === "KpgvCoEvVJENJbQe"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Cleric"]});
		}else if (fid === "KqYHBiDOspVLEjnS"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Druid"]});
		}else if (fid === "Kr18QgVsdpWGge40"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Paladin"]});
		}else if (fid === "KrxUJrL26mbaPybS"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Ranger"]});
		}else if (fid === "Kstoh47suTlBZkVg"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Rune Blade"]});
		}else if (fid === "Kt3gNPehMFi1BqaU"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Runecrafter"]});
		}else if (fid === "KtZ3ojH6GlhLgLXJ"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Sorcerer"]});
		}else if (fid === "KtiIMCXHY9yIFwk8"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Warlock"]});
		}else if (fid === "KtyqSZNvGfls3cFU"){
			IncarnateReference.crossReferenceInternalSpells({spellBroCaster:["Wizard"]});
		}else{
			console.warn("Internal Reference: ",fid," is currently not supported. Please report this message to ProNobis#7047 on either Foundries discord: https://discordapp.com/invite/DDBZUDf or on the Incarnate Gaming discord server: https://discord.gg/pqkeFYc");
		}
	}
	static incarnatePackFind(packName){
		if (packName == undefined){return false};
		var packs = game.packs;
		if (packName.includes(".")){
			var packFound = packs.find(pack => pack.collection === packName);
			if (packFound === undefined){
				packFound = packs.find(pack => pack.metadata.name === packName.split(".")[1]);
				console.warn("Pack reference to '",packName,"' does not contain a valid reference to holding module: error type 1");
			}
			return packFound;
		}else{
			const packFound = packs.find(pack => pack.metadata.name === packName);
			console.warn("Pack reference to '",packName,"' does not contain reference to holding module: error type 2");
			return packFound;
		}
	}
	static incarnateRoll(dice) {
		var numDice = 0, sizeDice= 0, modType="", modifier= 0, calculation= 0;
		var fullPattern= /^[0-9]+d[0-9]+[\+\-]{1}[0-9]+$/;
		var fullPatternFind = dice.split(/[\-\+d]/);
		if (dice.search(fullPattern)==0) {
			numDice = fullPatternFind[0];
			sizeDice = fullPatternFind[1];
			modifier = fullPatternFind[2];
			if (dice.search(/\-/)!=-1){
				modType="-";
			} else{
				modType="+";
			}
		} else if (dice.search(/^[0-9]+d[0-9]+$/)==0){
			numDice = fullPatternFind[0];
			sizeDice = fullPatternFind[1];
		} else if (dice.search(/^[0-9]+[\+\-]{1}[0-9]+$/)==0){
			calculation = fullPatternFind[0]*1;
			modifier = fullPatternFind[1];
			if (dice.search(/\-/)!=-1){
				modType="-";
			} else{
				modType="+";
			}
		} else if (dice.search(/^[0-9]+$/)==0){
			calculation = fullPatternFind[0]*1;
		} 
		for (var d=0;d<numDice;d++){
			calculation = calculation + Math.floor(Math.random()*sizeDice) + 1;
			rollCount++;
		}
		if (modType =="-"){
			modifier = modifier*-1;
		} else {
			modifier = modifier * 1;
		}
		calculation = calculation + modifier;
		return calculation;
	}
	//adds isPending, isRejected and isResolved properties to a promise
	static getPromiseStatus(promise){
		if (promise.isResolved) return promise;

		var isPending = true;
		var isRejected = false;
		var isResolved = false;

		var result = promise.then(
			function(v) {
				isResolved = true;
				isPending = false;
				return v;
			},
			function(e) {
				isRejected = true;
				isPending = false;
				throw e;
			}
		);
		result.isResolved = function() {return isResolved;};
		result.isPending = function() {return isPending;};
		result.isRejected = function() {return isRejected;};
		return result;
	}
	static async loadIncarnateTables() {
	  return fetch("modules/incarnateWorldBuilding/packs/incarnateTables.json").then(resp => resp.json());
	}
	static async loadIncarnateTemplates() {
	  return fetch("modules/incarnateWorldBuilding/packs/incarnateTemplates.json").then(resp => resp.json());
	}
	static recursiveTableTo(tableRows){
		var currentRow = tableRows.length - 1;
		for (currentRow; currentRow > -1; currentRow--){
			if (tableRows[currentRow].to !== 0){
				return tableRows[currentRow].to;
			}else if (currentRow === 0){
				return 0;
			}
		}
	}
	/*
	 * tableID = id of table
	 * incarnateTables = the tables array if already called to speed processing
	 * nestedCall = true if inside a nested call that needs to force an abort in other situations
	 */
	static async rollTable(tableID,incarnateTables){ 
		//if linguistic name force a nested Call and sanitization
		if (tableID === "nWo43aczXL5Qu1zd") return IncarnateReference.rollTableNested("nWo43aczXL5Qu1zd", incarnateTables);
		if (tableID === "nd7yy4dP0IZQHHvD") return IncarnateReference.rollTableNested("nd7yy4dP0IZQHHvD", incarnateTables);
		var random = Math.random(); //random number from 0-1
		var tablePosition;
		rollCount++;
		if (incarnateTables===null || incarnateTables===undefined){
			incarnateTables = await this.loadIncarnateTables();
		}
		for (var j in incarnateTables){
			if (incarnateTables[j]._id ==tableID){
				tablePosition = j;
			}
		}
		if (tablePosition === undefined){
			console.log("Missing Table "+tableID);
			return false;
		}
		var lastRow = incarnateTables[tablePosition].data.row.length - 1;
		var highrow = incarnateTables[tablePosition].data.row[lastRow].to; //finds to field of last row
		if (highrow === 0){
			highrow = this.recursiveTableTo(incarnateTables[tablePosition].data.row);
		}
		var tableRow =  Math.floor(random*highrow); // use random number to find row in table
		for (var i=0;i<lastRow+1;i++){
			if (incarnateTables[tablePosition].data.row[i].to>=tableRow){
				var result = document.createElement("div")
				result.innerHTML = incarnateTables[tablePosition].data.row[i].column[0].content;
				return result ;
			}
		}
		console.log("Missing Table 2 " + tableID);//missing table to console
		return "";
	}
	static async rollTableNested(tableID,incarnateTables){
		var fullResult = document.createElement("div");
		if (incarnateTables===null || incarnateTables===undefined){
			incarnateTables = await this.loadIncarnateTables();
		}
		do{
			var anotherTable = false;
			var random = Math.random(); //random number from 0-1
			var tablePosition;
			rollCount++;
			for (var j in incarnateTables){
				if (incarnateTables[j]._id ==tableID){
					tablePosition = j;
				}
			}
			if (tablePosition === undefined){
				console.log("Missing Table "+tableID);
				return false;
			}
			var lastRow = incarnateTables[tablePosition].data.row.length - 1;
			var highrow = incarnateTables[tablePosition].data.row[lastRow].to; //finds to field of last row
			if (highrow === 0){
				highrow = this.recursiveTableTo(incarnateTables[tablePosition].data.row);
			}
			var tableRow =  Math.floor(random*highrow); // use random number to find row in table
			for (var i=0;i<lastRow+1;i++){
				if (incarnateTables[tablePosition].data.row[i].to>=tableRow){
					var result = incarnateTables[tablePosition].data.row[i].column[0].content;
					if (fullResult.innerHTML === ""){
						fullResult.innerHTML = result;
					}else{
						var genNodes = fullResult.getElementsByClassName("generate");
						var genNodeLen = genNodes.length;
						for (var k=0; k<genNodeLen; k++){
							if (genNodes[k].getAttribute("data-fid") === tableID){
								if (genNodes[k].getAttribute("data-date") === null){
									genNodes[k].setAttribute("data-date",IncarnateCalendar.incarnateDate());
									genNodes[k].innerHTML = result;
								}
							}
						}
					}
				}
			}
			var genNodes = fullResult.getElementsByClassName("generate");
			for (var l=0; l<genNodes.length; l++){
				if (genNodes[l].getAttribute("data-date") === null){
					anotherTable = true;
					tableID = genNodes[l].getAttribute("data-fid");
					break;
				}
			}
		}while (anotherTable === true);
		fullResult.innerHTML = IncarnateReference.sanitizeName(fullResult.innerHTML);
		fullResult.innerHTML = fullResult.innerHTML.replace(/\s/g,"");
		console.log(fullResult.innerHTML);
		return fullResult;
	}
	static async generation(input){
		const incarnateTables = await this.loadIncarnateTables();
		var found;
		var data = document.createElement("div");
		data.setAttribute("id","tempNode");
		data.innerHTML = input;
		var generateNodes = data.getElementsByClassName("generate");//var pattern = /[a-zA-Z]{6}/gmi;
		//console.log("input",input,"generateNodes",generateNodes);
		var genNodeLen = generateNodes.length;
		do{
			found = false;
			genNodeLen = generateNodes.length;
			for (var b=0;b<genNodeLen;b++){
				if (generateNodes[b].hasAttribute("data-date")){
				}
				else{
					var nodeQuantity;
					if (generateNodes[b].getAttribute("data-quantity")!=null){
						nodeQuantity = generateNodes[b].getAttribute("data-quantity");
						nodeQuantity = this.incarnateRoll(nodeQuantity);
					}else{
					nodeQuantity = 1;
					}
					found = true;
					var fid=generateNodes[b].getAttribute("data-fid");
					var result ="";
					//console.log("fid",fid,"quantity",nodeQuantity);
					for (var e=0;e<nodeQuantity;e++){
						var preresult = await this.rollTable(fid,incarnateTables);
						if (preresult.getElementsByTagName("p").length==1){
							preresult=preresult.innerHTML;
							preresult=preresult.replace(/<p> ?/,"");
							preresult=preresult.replace(/ ?<\/p>/,"");
						}else{
							preresult=preresult.innerHTML;
						}
						result = result + preresult;
					}
					generateNodes[b].innerHTML = result;
					generateNodes[b].setAttribute("data-date",IncarnateCalendar.incarnateDate());
				}
			}
		}while (found === true);
		genNodeLen = generateNodes.length;
		do {
			found = false;
			var calcNodes = data.getElementsByTagName("calculate");
			var calcNodeLen = calcNodes.length;
			for (var f=0;f<calcNodeLen;f++){
				if (calcNodes[f].hasAttribute("data-date")){
				}
				else {
					calcNodes[f].innerHTML=this.incarnateRoll(calcNodes[f].innerHTML);
					calcNodes[f].setAttribute("data-date",IncarnateCalendar.incarnateDate());
				}
			}
		}
		while (found ===true);
		do {
			found = false;
			var genLinkNodes = data.getElementsByClassName("genLink");
			var genLinkNodesLen = genLinkNodes.length;
			for (var c=0;c<genLinkNodesLen;c++){
				if (genLinkNodes[c].hasAttribute("data-date")){
				}
				else {
					found = true;
					var linkFid = genLinkNodes[c].getAttribute("data-fid");
					result = "";
					for (var b=0;b<genNodeLen;b++){
						if (linkFid == generateNodes[b].getAttribute("data-fid")){
							result = result + generateNodes[b].innerHTML + " ";
						}
					}
					genLinkNodes[c].innerHTML = result;
					genLinkNodes[c].setAttribute("data-date",IncarnateCalendar.incarnateDate());
				}
			}
		}
		while (found===true);
		data=data.innerHTML;
		return data;
	}
	static sanitizeName(name){
		name = name.replace(/\u21b5|[\r\n]/g,"");
		name = name.replace(/> <\//g,"></");
		name = name.replace(/<.*?>/g,"");
		name = name.replace(/^\s/g,"");
		name = name.replace(/\s$/g,"");
		return name;
	}
	static templateInsert(ev){
		const loreGenerator = IncarnateReference.getClosestClass(ev.srcElement,"loreGenerator");
		const templatePosition = loreGenerator.getElementsByClassName("templatePosition")[0];
		IncarnateReference.populateTemplateInsert(templatePosition.value.split("__")[0]);
	}
	static getClosestClass (elem,targetClass){
		while (elem.classList.contains(targetClass) === false && elem.classList.contains("vtt") === false){
			elem = elem.parentElement;
		}
		if (elem.classList.contains(targetClass)) return elem;
		return false;
	}
	static sortAlphabeticallyName(data){
		data.sort(function(a,b){
			const x = a.name.toLowerCase();
			const y = b.name.toLowerCase();
			if (x < y) {return -1};
			if (y < x) {return 1};
			return 0;
		});
		return data;
	}
	/*
	 * logic to split between generating journal entries and special cases
	 */
	static async populateTemplateInsert(fid,parentElement){
		const incarnateTemplates = await this.loadIncarnateTemplates();
		const template = incarnateTemplates.find(templates=>templates._id === fid);
		if (template === undefined){
			console.warn("Template: ", fid, " not found");
			return false;
		}
		var result, resultType;
		if (template.flags.templateType === "NPCs"){
			if (typeof npcGeneration !== "undefined"){
				result = await npcGeneration(template,parentElement);
				resultType = "Actor";
			}else{
				result = await this.populateCreateJournalTemplate(template,parentElement);
				resultType = "JournalEntry";
			}
		}else{
			result = await this.populateCreateJournalTemplate(template,parentElement);
			resultType = "JournalEntry";
		}
		return {"result":result,"resultType":resultType};
	}
	/*
	 * generation of journal entries that returns the journal entry
	 */
	static async populateCreateJournalTemplate(template,parentElement){
		if (parentElement === undefined) parentElement = "";
		var tempContents = "<incTempHead class=\"TemplateTitle\">" + template.name + "</incTempHead>\n" + parentElement + template.data.description
		var tempContents =  await this.generation(tempContents);
		var tempName = tempContents.match(/<incTempHead class="TemplateTitle">(.|[\r\n])*?<\/incTempHead>/gi);
		const incRegions = game.settings.get("incarnateWorldBuilding","incRegions");
		tempName = IncarnateReference.sanitizeName(tempName[0]);
		const data = {
			name:tempName,
			permission:{"default":0},
			folder:incRegions.currentRegion,
			flags:{
				recurrence:template.data.recurrence,
				sourceID:template._id,
				sourceName:"",
				date:IncarnateCalendar.incarnateDate()
			},
			content:tempContents
		}
		const newJournal = await JournalEntry.create(data);
		return newJournal;
	}
	static generate(){
		console.log("generate");
	}
	static populateSetClick(node){
		const populates = node.getElementsByClassName("populate");
		const crossRefLen = populates.length;
		for (var a = 0; a<crossRefLen; a++){
			populates[a].addEventListener("click",IncarnateReference.populateClick);
		}
	}
	static populateClick(ev) {
		IncarnateReference.populate(ev);
	}
	static populate(ev){
		if (ev.currentTarget.getAttribute("data-date"))return false;
		const app = IncarnateReference.getClosestClass(ev.currentTarget,"app");
		var type, name;
		if (app.id.split("-")[0] === "journal"){
			type = "JournalEntry";
		}
		if (type === "JournalEntry"){
			name = app.getElementsByTagName("input")[0].value;
		}
		const fid = app.id.split("-")[1];
		const parentElement = '<strong>Parent Element:</strong><span class="crossReference" data-fid="'+ fid +'" data-type="'+ type +'">'+ name +'</span>\n';
		const childFid = ev.currentTarget.getAttribute("data-fid");
		const newEntry = this.populateTemplateInsert(childFid,parentElement);
		newEntry.then(entry => {
			const entryType = entry.resultType;
			entry = entry.result;
			const origin = game.journal.get(fid);
			var holder = document.createElement("div");
			holder.innerHTML = origin.data.content;
			var populateNodes = holder.getElementsByClassName("populate");
			var populateNodesThis = [];
			for (let node of populateNodes) {
				if (node.getAttribute("data-fid") === childFid){
					populateNodesThis.push(node);
				}
			}
			var targetNode;
			for (var a=0; a<populateNodesThis.length; a++){
				if (!populateNodesThis[a].getAttribute("data-date")){
					targetNode = populateNodesThis[a];
					break;
				}
			}
			targetNode.setAttribute("data-date",IncarnateCalendar.incarnateDate());
			var crossReferenceNode = document.createElement("span");
			crossReferenceNode.setAttribute("class","crossReference");
			crossReferenceNode.setAttribute("data-fid",entry.data._id);
			crossReferenceNode.setAttribute("data-type",entryType);
			crossReferenceNode.setAttribute("draggable","true");
			crossReferenceNode.innerHTML = entry.data.name;
			targetNode.innerHTML = crossReferenceNode.outerHTML;
			let journal = game.journal.get(fid);
			journal.update({content:holder.outerHTML});
			journal.render(false);
		});
	}
	static getInputValue(element){
		return element.type === "number" ? Number(element.value):
			element.type === "text" ? element.value :
			element.type === "checkbox" && element.checked ? true :
			element.type === "checkbox" ? false : "";
	}
	/*data = data of containing class
	 * content = content to be sanitized and used
	 * target = path to content
	 */
	static mce(data,content,target){
		const editor = Handlebars.helpers.editor({
		data:{
				root:data
			},hash:{
				button:true,
				content:content,
				editable:true,
				owner:true,
				target:target
			},
			name:"editor"
		});
		return editor;
	}
}
/**
* GM Blind
*/
//prepares a variable to count number of rolls from generator
var rollCount =0;
function incarnateGMblind () {
	if (ui._gmblind === undefined){
		ui._gmblind = new GmsBlind();
	}
	ui._gmblind.render(true);
}
class GmsBlind extends Application {

	/**
	* Define default options for the PartySummary application
	*/
	static get defaultOptions() {
		const options = super.defaultOptions;
		var settings = game.settings.get("incarnate","incWindowMemory");
		options.width = settings.gmScreen.width;
		options.height = settings.gmScreen.height;
		options.top = settings.gmScreen.top;
		options.left = settings.gmScreen.left;
		options.template = "modules/incarnateWorldBuilding/templates/incarnateGMBlind.html";
		options.classes = ["incarnate-Gms-Blind", "app", "window-app"]
		options.resizable = true;
		return options;
	}
	/* -------------------------------------------- */
	async close() {
		var settings = game.settings.get("incarnate","incWindowMemory");
		settings.gmScreen = this.position;
		game.settings.set("incarnate","incWindowMemory",settings);
		super.close();
	}

	/**
	* Return the data used to render the summary template
	* Get all the active users
	* The impersonated character for each player is available as user.character
	*/
	getData() {
		this.options.title = "GM Screen";
		var templateData = {"folder":[]};
		var folders = game.folders.entities;
		var folderLen = folders.length;
		var selectFolder = document.getElementById("journalFolder");
		for (var b=0;b<folderLen; b++){
			if (folders[b].type == "JournalEntry"){
				templateData.folder.push({
					"name":folders[b].name,
					"value":folders[b]._id
				});
			}
		}
		var referenceCalendar = game.settings.get("incarnate","incCalendar");
		templateData.referenceCalendar=referenceCalendar;
		templateData.month=referenceCalendar.monthNames[referenceCalendar.date.m-1];
		if (templateData.referenceCalendar.date.i < 10){
			templateData.referenceCalendar.date.i = "0" + templateData.referenceCalendar.date.i;
		}
		if (templateData.referenceCalendar.date.s < 10){
			templateData.referenceCalendar.date.s = "0" + templateData.referenceCalendar.date.s;
		}
		templateData.title="GM's Blind";
		templateData.sceneGenSettings = game.settings.get("incarnate","incSceneGenSettings");
		templateData.statRollSettings = game.settings.get("incarnate","incStatRoll");
		console.log(templateData);
		return templateData;
	}
	static async addDropDown (ev,srcElement){
		var preSelect = srcElement || ev.srcElement;
		var mySelect = preSelect.options[preSelect.selectedIndex].text;
		var select = preSelect.parentElement.parentElement.getElementsByClassName("templatePosition")[0];
		select.innerHTML = "";
		const incarnateTemplates = await IncarnateReference.loadIncarnateTemplates();
		var templateLen = incarnateTemplates.length;
		for (var a=0; a<templateLen;a++){
			if (incarnateTemplates[a].flags.templateType == mySelect){
				var option = document.createElement("option"),
					tempName = incarnateTemplates[a].name;
				if (tempName.search(/class="generate"/)!=-1){
					tempName = tempName.replace(/ ?\-? ?<span class="generate".*<\/span> ?\-? ?/,"")
				}
				tempName= IncarnateReference.sanitizeName(tempName);
				/*
				if (tempName.search(/<h1>.*<\/h1>/) !=-1){
					tempName = tempName.replace(/<h1>/,"");
					tempName = tempName.replace(/<\/h1>/,"");
				}
				*/
				option.text=tempName;
				option.value= incarnateTemplates[a]._id + "__" + tempName;
				select.appendChild(option);
			}
		}
		return 0;
	}
	/* -------------------------------------------- */
	static setRegion(ev){
		var settings = game.settings.get("incarnateWorldBuilding","incRegions");
		const region = ev.srcElement.value;
		settings.currentRegion = region;
		console.log(region,game.folders.get(region));
		const folder = game.folders.get(region);
		if (folder.data.flags.incRegions !== undefined){
			if (folder.data.flags.incRegions.incStatRoll === undefined){
				IncarnateStatRoll.addToFolder(folder);
			}
		}
		game.settings.set("incarnateWorldBuilding","incRegions",settings);
	}

	/**
	* Add some event listeners to the UI to provide interactivity
	*/
	activateListeners(html){
		const htmlDom = $(html)[0];
		if (htmlDom === undefined) return true;

		//listener for region change
		let regionFolder = $(html)[0].getElementsByClassName("incarnate-journalListing")[0];
		regionFolder.addEventListener("change",GmsBlind.setRegion);
		//listener for folder change
		let templateFolder = htmlDom.getElementsByClassName("templateType");
		[].forEach.call(templateFolder, folder =>{
			folder.addEventListener("change",GmsBlind.addDropDown)
		});
		GmsBlind.addDropDown(undefined,htmlDom.getElementsByClassName("templateType")[0]);
		//listener for stat settings change
		let statSetting = htmlDom.getElementsByClassName("statSetting");
		[].forEach.call(statSetting, setting=>{
			setting.addEventListener("change",GmsBlind.statSettingChange);
		});
		let addLeast = htmlDom.getElementsByClassName("atLeast-create");
		[].forEach.call(addLeast, add=>{
			add.addEventListener("click",GmsBlind.addLeast);
		});
		let deleteLeast = htmlDom.getElementsByClassName("atLeast-delete");
		[].forEach.call(deleteLeast, setting=>{
			setting.addEventListener("click",GmsBlind.deleteLeast);
		});
		let addMost = htmlDom.getElementsByClassName("atMost-create");
		[].forEach.call(addMost, add=>{
			add.addEventListener("click",GmsBlind.addMost);
		});
		let deleteMost = htmlDom.getElementsByClassName("atMost-delete");
		[].forEach.call(deleteMost, setting=>{
			setting.addEventListener("click",GmsBlind.deleteMost);
		});
		let updateCheckbox = htmlDom.getElementsByClassName("booleanSetting");
		[].forEach.call(updateCheckbox, setting=> {
			setting.addEventListener("click",GmsBlind.updateCheckbox);
		});
		//listeners for Map Generate Settings
		let sceneSetting = htmlDom.getElementsByClassName("sceneGenSetting");
		[].forEach.call(sceneSetting, setting=>{
			setting.addEventListener("change",GmsBlind.sceneSettingChange);
		});
		let generateForest = htmlDom.getElementsByClassName("generateForest");
		[].forEach.call(generateForest, add=>{
			add.addEventListener("click",IncarnateSceneGen.newForest);
		});
		let generateDungeon = htmlDom.getElementsByClassName("generateDungeon");
		[].forEach.call(generateDungeon, add=>{
			add.addEventListener("click",IncarnateSceneGen.newDungeon);
		});
		let handlerResetMapSettings = async ev =>{
			IncarnateSceneGen.resetDefault();
			await IncarnateReference.incarnateDelay(500);
			ui._gmblind.render(false);
		}
		let resetMapSettings = htmlDom.getElementsByClassName("resetMapSettings");
		[].forEach.call(resetMapSettings, add=>{
			add.addEventListener("click",handlerResetMapSettings);
		});
		//listener to make main tabs work
		let nav = $('.tabs[data-group="incarnateGMblindGroup"]');
		new Tabs(nav, {
			initial: "tab1",
			callback: t => console.log("Tab ${t} was clicked")
		});
		//listener to make scene tabs work
		let nav2 = $('.tabs[data-group="incarnateGMblindScenes"]');
		new Tabs(nav2, {
			initial: "tab1",
			callback: t => console.log("Tab ${t} was clicked")
		});
		//listener to make Insert Template work
		let insertTemplate = htmlDom.getElementsByClassName("insertTemplateButton");
		[].forEach.call(insertTemplate, button => {
			button.addEventListener("click",IncarnateReference.templateInsert);
		});
	}
	static async addLeast(ev){
		const settings = game.settings.get("incarnate","incStatRoll");
		settings.guarantee.atLeast.push({value:0, quantity:0});
		game.settings.set("incarnate","incStatRoll",settings);
		await IncarnateReference.incarnateDelay(50);
		ui._gmblind.render(true);
	}
	static async deleteLeast(ev){
		const id = IncarnateReference.getClosestClass(ev.srcElement,"atLeast-entry").getAttribute("data-id");
		const settings = game.settings.get("incarnate","incStatRoll");
		settings.guarantee.atLeast.splice(id,1);
		game.settings.set("incarnate","incStatRoll",settings);
		await IncarnateReference.incarnateDelay(50);
		ui._gmblind.render(true);
	}
	static async addMost(ev){
		const settings = game.settings.get("incarnate","incStatRoll");
		settings.guarantee.atMost.push({value:0, quantity:0});
		game.settings.set("incarnate","incStatRoll",settings);
		await IncarnateReference.incarnateDelay(50);
		ui._gmblind.render(true);
	}
	static async deleteMost(ev){
		const id = IncarnateReference.getClosestClass(ev.srcElement,"atMost-entry").getAttribute("data-id");
		const settings = game.settings.get("incarnate","incStatRoll");
		settings.guarantee.atMost.splice(id,1);
		game.settings.set("incarnate","incStatRoll",settings);
		await IncarnateReference.incarnateDelay(50);
		ui._gmblind.render(true);
	}
	static updateCheckbox(ev){
		const element = ev.srcElement;
		const value = element.checked;
		const name = element.name;
		const settings = game.settings.get("incarnate","incStatRoll");
		const newSettings = setProperty(settings,name,value);
		game.settings.set("incarnate","incStatRoll",settings);
	}
	static statSettingChange(ev){
		const element = ev.srcElement;
		const value = element.type === "number" ? Number(element.value) : element.value;
		const name = element.name;
		const settings = game.settings.get("incarnate","incStatRoll");
		const newSettings = setProperty(settings,name,value);
		game.settings.set("incarnate","incStatRoll",settings);
	}
	static sceneSettingChange(ev){
		const element = ev.srcElement;
		const settings = game.settings.get("incarnate","incSceneGenSettings");
		const value = element.type === "number" ? Number(element.value) : 
			element.type === "checkbox" ? element.checked : element.value;
		const name = element.name;
		const newSettings = setProperty(settings,name,value);
		game.settings.set("incarnate","incSceneGenSettings",settings);
	}
}
class IncarnateDialog extends Dialog{
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.template = "modules/incarnateWorldBuilding/templates/incarnateDialog.html";
		return options;
	}
	getData() {
		let buttons = Object.keys(this.data.buttons).reduce((obj, key) => {
			let b = this.data.buttons[key];
			if ( b.condition !== false ) obj[key] = b;
			return obj;
		}, {});
		return {
			content: this.data.content,
			buttons: buttons,
			selection: this.data.selection
		}
	}
}
class IncarnateJournalEntry {
	static newQuest (ev){
		console.log(ev,ev.srcElement,IncarnateReference.getClosestClass(ev.srcElement,"app"));
		const app = IncarnateReference.getClosestClass(ev.srcElement,"app");
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
class IncarnateQuestEditor extends FormApplication {
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
class IncarnateStatRoll{
	//conversion script added on 9/13/2019 to add support for regional stat roll settings in older data sets
	static addToFolder(folder){
		var flags = JSON.parse(JSON.stringify(folder.data.flags));
		var found = false;
		if (folder.data.parent !== null){
			const parentFolder = game.folders.get(folder.data.parent);
			if (parentFolder.data.flags.incRegions !== undefined){
				if (parentFolder.data.flags.incRegions.incStatRoll !== undefined){
					flags.incRegions.incStatRoll = parentFolder.data.flgas.incRegions.incStatRoll;
					found = true;
				}
			}
		}
		if (found === false){
			const worldStatRoll = game.settings.get("incarnate","incStatRoll");
			flags.incRegions.incStatRoll = worldStatRoll;
		}
		folder.update({flags:flags});
	}
	static playerStatRoll(userId){
		const user = game.users.get(userId);
		const flags = JSON.parse(JSON.stringify(user.data.flags));
		if (flags.statRolls === undefined){
			flags.statRolls = [];
		}
		const settings = game.settings.get("incarnate","incStatRoll");
		const statRoll = IncarnateStatRoll.statRoll(settings.dice,settings.guarantee,settings.rolls,settings.abortCountTrigger,settings.forceOrder);
		flags.statRolls.push({
			statRoll:statRoll,
			date: Date.now(),
			gameDay:IncarnateCalendar.incarnateDate(),
			settings:settings
		});
		user.update({flags:flags});
		return statRoll;
	}
	static statAudit(userName){
		const user = game.users.entities.find(user => user.data.name === userName);
		if (user === undefined){
			console.log("User: ",userName," not found");
			return false;
		}
		const flags = user.data.flags;
		var message ="<h3>" + userName + "</h3>";
		if (flags.statRolls !== undefined){
			flags.statRolls.forEach(roll =>{
				message+= "<p><strong>" + new Date(roll.date).toDateString() + "</strong> " + IncarnateCalendar.toDateString(roll.gameDay) + "</p><p>" + JSON.stringify(roll.statRoll) + "</p>";
			})
		}
		return message;
	}
	static statAuditHard(userName){
		const user = game.users.entities.find(user => user.data.name === userName);
		if (user === undefined){
			console.log("User: ",userName," not found");
			return false;
		}
		const flags = user.data.flags;
		var message ="<h3>" + userName + "</h3>";
		if (flags.statRolls !== undefined){
			flags.statRolls.forEach(roll =>{
				message+= "<p><strong>" + new Date(roll.date).toDateString() + "</strong> " + IncarnateCalendar.toDateString(roll.gameDay) + "</p><p>" + JSON.stringify(roll.statRoll) + "</p>" + "<p><strong>Dice:</strong> " + JSON.stringify(roll.settings.dice) + "</p><p><strong>Guarantees</strong></p><p>" + JSON.stringify(roll.settings.guarantee) + "</p>";
			})
		}
		return message;
	}
	static statRoll(dice,guarantee,rolls,abortCountTrigger,forceOrder){
		abortCountTrigger = Number(abortCountTrigger) || 50;
		dice = dice || "4d6dl";
		guarantee = guarantee || IncarnateStatRoll.incarnateStatRollDefaultArray();
		rolls = Number(rolls) || 6;
		forceOrder = forceOrder || false;
		var rolledArray = [];
		var abortCount = 0;
		do{
			rolledArray = Roll.simulate(dice,rolls);
			abortCount++;
			if (Number(dice.substr(0,1) > 0)){
				rollCount += (rolls * Number(dice.substr(0,1)));
			}else{
				rollCount += (rolls*3);
			}
			if (guarantee !== undefined){
				if (guarantee.max === undefined) guarantee.max = 10000;
				if (guarantee.min === undefined) guarantee.min = 0;
				for (var a=0; a<rolls; a++){
					rolledArray[a] = rolledArray[a] > guarantee.max ? guarantee.max:
						rolledArray[a] < guarantee.min ? guarantee.min : rolledArray[a];
				}
			}
		}while(IncarnateStatRoll.statRollGuarantee(rolledArray,guarantee) === false && abortCount < abortCountTrigger);
		if (abortCount === abortCountTrigger) console.warn("Stat roll aborted after "+ abortCountTrigger + " rolls.");
		if (forceOrder === false){
			rolledArray = rolledArray.sort((a,b) => b-a);
		}
		return rolledArray;
	}
	static statRollGuarantee(rolledArray,guarantee){
		if (guarantee === undefined) return true;
		if (guarantee.atLeast !== undefined){
			if (guarantee.atLeast.length > 0){
				for (var a=0; a<guarantee.atLeast.length; a++){
					var filteredStats = rolledArray.filter(stat => stat >= guarantee.atLeast[a].value);
					if (filteredStats.length < guarantee.atLeast[a].quantity) return false;
				}
			}
		}
		if (guarantee.atMost !== undefined){
			if (guarantee.atMost.length > 0){
				for (var a=0; a<guarantee.atMost.length; a++){
					var filteredStats = rolledArray.filter(stat => stat <= guarantee.atMost[a].value);
					if (filteredStats.length < guarantee.atMost[a].quantity) return false;
				}
			}
		}
		if (guarantee.statSumMax !== undefined || guarantee.statSumMin !== undefined || guarantee.modSumMax !== undefined || guarantee.modSumMin !== undefined){
			var statTotal = 0;
			var modTotal = 0;
			for (var a=0; a<rolledArray.length; a++){
				statTotal += rolledArray[a];
				modTotal += IncarnateStatRoll.incarnateStatConvert(rolledArray[a]);
			}
			console.log("Stat Sum: ",statTotal,"Mod Sum: ",modTotal);
			if (guarantee.statSumMax !== undefined){
				if (guarantee.statSumMax < statTotal) return false;
			}
			if (guarantee.statSumMin !== undefined){
				if (guarantee.statSumMin > statTotal) return false;
			}
			if (guarantee.modSumMax !== undefined){
				if (guarantee.modSumMax < modTotal) return false;
			}
			if (guarantee.modSumMin !== undefined){
				if (guarantee.modSumMin > modTotal) return false;
			}
		}
		return true;
	}
	static incarnateStatConvert(score){
		return Math.floor((score - 10) / 2);
	}
	static incarnateSetupDefaults(){
		game.settings.register("incarnate","incStatRoll", {
			name: "Stat Roll Options",
			hint: "Tracks defaults for automated stat rolling.",
			default: "",
			type: Object,
			scope: 'world',
			onChange: settings => {
				console.log(settings);
			}
		});
		if( game.settings.get("incarnate","incStatRoll") !=""){
			return(game.settings.get("incarnate","incStatRoll"));
		}else {
			console.log("Creating StatRoll Settings");
			var tempStatRoll = IncarnateStatRoll.incarnateStatRollDefaultArray();
			game.settings.set("incarnate","incStatRoll",tempStatRoll);
			return(tempStatRoll);
		}
	}
	static incarnateStatRollDefaultArray(){
		return {
			abortCountTrigger:50,
			dice:"4d6dl",
			rolls:6,
			forceOrder:false,
			guarantee:{
				max: 18,
				min: 6,
				atLeast:[
					{value:15,quantity:1}
				],
				atMost:[
					{value:7, quantity:1}
				],
				statSumMax:300,
				statSumMin:0,
				modSumMax:60,
				modSumMin:-60
			}
		}
	}
}
class IncarnateSceneGen{
	static incarnateSetupDefaults(){
		game.settings.register("incarnate","incSceneGenSettings", {
			name: "Scene Generation Options",
			hint: "Tracks the default options for random scene generation.",
			default: "",
			type: Object,
			scope: 'world',
			onChange: settings => {
				console.log(settings);
			}
		});
		if( game.settings.get("incarnate","incSceneGenSettings") !=""){
			return(game.settings.get("incarnate","incSceneGenSettings"));
		}else {
			console.log("Creating Scene Generate Settings");
			var tempSceneSet = IncarnateSceneGen.defaultArray();
			game.settings.set("incarnate","incSceneGenSettings",tempSceneSet);
			return(tempSceneSet);
		}
	}
	static resetDefault(){
		console.log("Creating Scene Generate Settings");
		var tempSceneSet = IncarnateSceneGen.defaultArray();
		game.settings.set("incarnate","incSceneGenSettings",tempSceneSet);
		return(tempSceneSet);
	}
	static defaultArray(){
		return {
			title:"",
			forest:{
				breakAfter:50,
				treeNum:100,
				treeSize:3,
				floor:"modules/incarnateAssets/Images/Textures/Stone002_0512.JPG",
				floorColor:"#000000",
				tree:"modules/incarnateAssets/Images/Textures/Wood001_0512.JPG",
				treeColor:"#000000",
				trunkSize:33
			},
			sceneCount:1,
			polygon:{
				minA:20,
				maxA:70,
				minL:10,
				maxL:50,
				x:300,
				y:300
			},
			dungeon:{
				breakAfter:50,
				hallWidth:2,
				randEnc:true,
				rooms:6,
				roomMinL:5,
				roomMaxL:10,
				roomDesc:true,
				traceWalls:true,
				floor:"modules/incarnateAssets/Images/Textures/Stone002_0512.JPG",
				floorColor:"#000000",
				room:"modules/incarnateAssets/Images/Textures/Wood001_0512.JPG",
				roomColor:"#000000",
				hall:"modules/incarnateAssets/Images/Textures/Wood001_0512.JPG",
				hallColor:"#000000"
			},
			width:3000,
			height:3000
		}
	}
	static drawingObject(){
		const user = game.userId;
		return {
			author:user,
			bezierFactor: 0.5,
			fillAlpha: 1,
			fillColor: "#000000",
			fillType: 0,
			flags:{
			},
			fontFamily:"Signika",
			fontSize:48,
			height:100,
			hidden:false,
			id:1,
			locked:false,
			points:[],
			rotation:0,
			strokeAlpha:1,
			strokeColor:"#000000",
			strokeWidth:12,
			textAlpha:0.5,
			textColor:"#FFFFFF",
			texture:"",
			type:"e",
			width:10,
			x:10,
			y:100,
			z:0
		}
	}
	static async newForest(name,width,height){
		const settings = game.settings.get("incarnate","incSceneGenSettings");
		width = Number(width) || Number(settings.width) || 3000;
		height = Number(height) || Number(settings.height) || 3000;
		if (typeof name === "object"){
			if (settings.title !== ""){
				name = settings.title;
			}else{
				name = "Forest " + settings.sceneCount;
				settings.sceneCount++;
				game.settings.set("incarnate","incSceneGenSettings",settings);
			}
		}
		const scene = await CONFIG.Scene.entityClass.create({name:name,width:width,height:height});
		IncarnateSceneGen.forestGeneration(settings.forest.treeNum, settings.forest.treeSize, settings.forest.trunkSize, settings.forest.breakAfter, scene);
	}
	static forestGeneration(treeNum,treeSize,trunkSize,breakAfter,scene){
		treeNum = Number(treeNum) || 100;
		treeSize = Number(treeSize) || 3;
		trunkSize = Number(trunkSize) || 33;
		breakAfter = Number(breakAfter) || 50;
		scene = scene || game.scenes.active;
		const sceneHeight = Number(scene.data.height) * 1.4;
		const sceneWidth = Number(scene.data.width) * 1.4;
		const sceneGrid = Number(scene.data.grid);
		const drawings = [];
		const walls = [];
		const user = game.userId;
		var id = 1, forceContinue=0, wallId = 1;
		for (var a=0; a<treeNum; a++){
			const sizeDirection = Math.random()>0.5 ? 1 : -1;
			const sizeMod = (Math.random() * 0.2 * sizeDirection) + 1;
			//const sizeMod = 1;
			const width = treeSize * sceneGrid *sizeMod, height= treeSize * sceneGrid *sizeMod;
			const trunk = trunkSize * width /100; 
			const trunkSide = (width - trunk)/2;
			forceContinue=0;
			var drawing = IncarnateSceneGen.drawingObject();
			drawing.id = id;
			drawing.flags = {
				type:"tree",
				walls:[],
				regular:true
			};
			drawing.fillType=1;
			drawing.fillAlpha=1;
			drawing.fillColor="#194C19";
			drawing.strokeWidth=2;
			drawing.width = width;
			drawing.height = height;
			do{
				drawing.x = Math.random() * sceneWidth;
				drawing.y = Math.random() * sceneHeight;
				rollCount += 2;
				forceContinue++;
				var checkCollide = IncarnateSceneGen.checkCollide(drawing,drawings,sceneGrid/10);
			}while(checkCollide && forceContinue < breakAfter);
			if (forceContinue === breakAfter){
				break;
			}
			walls.push({
				c:[drawing.x+trunkSide,drawing.y+trunkSide,drawing.x + trunkSide,drawing.y+ trunkSide + trunk],
				door:0,
				flags:{
					type:"tree"
				},
				id:wallId,
				move:1,
				sense:2
			});
			drawing.flags.walls.push(wallId);
			wallId++;
			walls.push({
				c:[drawing.x + trunkSide, drawing.y + trunkSide, drawing.x + trunk + trunkSide, drawing.y + trunkSide],
				door:0,
				flags:{
					type:"tree"
				},
				id:wallId,
				move:1,
				sense:2
			});
			drawing.flags.walls.push(wallId);
			wallId++;
			walls.push({
				c:[drawing.x + trunkSide, drawing.y + trunkSide + trunk, drawing.x + trunkSide + trunk, drawing.y + trunkSide + trunk],
				door:0,
				flags:{
					type:"tree"
				},
				id:wallId,
				move:1,
				sense:2
			});
			drawing.flags.walls.push(wallId);
			wallId++;
			walls.push({
				c:[drawing.x + trunkSide + trunk, drawing.y + trunkSide, drawing.x + trunkSide + trunk, drawing.y + trunkSide + trunk],
				door:0,
				flags:{
					type:"tree"
				},
				id:wallId,
				move:1,
				sense:2
			});
			drawing.flags.walls.push(wallId);
			wallId++;
			drawings.push(drawing);
			id++;
		}
		scene.update({drawings:drawings,walls:walls});
	}
	static async newDungeon(name,width,height){
		const settings = game.settings.get("incarnate","incSceneGenSettings");
		width = Number(width) || Number(settings.width) || 3000;
		height = Number(height) || Number(settings.height) || 3000;
		if (typeof name === "object"){
			if (settings.title !== ""){
				name = settings.title;
			}else{
				name = "Dungeon " + settings.sceneCount;
				settings.sceneCount++;
				game.settings.set("incarnate","incSceneGenSettings",settings);
			}
		}
		const scene = await CONFIG.Scene.entityClass.create({name:name,flags:{dungeon:settings.dungeon},width:width,height:height});
		const newDungeon = await IncarnateSceneGen.dungeonGeneration(scene, settings.dungeon.rooms, settings.dungeon.roomMinL, settings.dungeon.roomMaxL, settings.dungeon.hallWidth);
		const dungeonWalls = await IncarnateSceneGen.dungeonWalls(newDungeon.drawings);
		var walls = dungeonWalls.walls,
			drawings = dungeonWalls.drawings,
			notes = [];
		if (settings.dungeon.traceWalls === true){
			const dungeonTraceWalls = await IncarnateSceneGen.dungeonTraceWalls(walls,drawings);
			walls = dungeonTraceWalls.walls;
			drawings = dungeonTraceWalls.drawings;
		}
		if (settings.dungeon.roomDesc === true){
			const dungeonRoomDesc = await IncarnateSceneGen.dungeonRoomDesc(drawings,notes);
			drawings = dungeonRoomDesc.drawings;
			notes = dungeonRoomDesc.notes;
		}
		scene.update({drawings:drawings,notes:notes,walls:walls});
	}
	static async dungeonGeneration(scene,rooms,roomMinL,roomMaxL,hallWidth,breakAfter){
		const settings = game.settings.get("incarnate","incSceneGenSettings");
		scene = scene || game.scenes.active;
		rooms = Number(rooms) || 5;
		const sceneGrid = Number(scene.data.grid);
		roomMinL = Number(roomMinL) * sceneGrid || 400;
		roomMaxL = Number(roomMaxL) * sceneGrid || 1000;
		breakAfter = Number(breakAfter) || 50;
		//roomMinL removed to prevent over-extending, sceneGrid added to compensate for rounding
		const sceneBorderWidth = Math.ceil(Number(scene.data.width) *.1/sceneGrid)*sceneGrid;
		const sceneBorderHeight = Math.ceil(Number(scene.data.height) *.1/sceneGrid)*sceneGrid;
		const sceneWidth = Number(scene.data.width)*1.2 - roomMinL + sceneGrid;
		const sceneHeight = Number(scene.data.height)*1.2 - roomMinL + sceneGrid;
		hallWidth = Number(hallWidth)* sceneGrid || 2 * sceneGrid;
		const drawings =[];
		var reservedId = 1
		var hallId = rooms * 2;
		var dunId = rooms * 2 + hallId;
		if (settings.dungeon.floor !== ""){
			var tempRoom = IncarnateSceneGen.drawingObject();
			tempRoom.type = "r";
			tempRoom.flags.type="floor";
			tempRoom.texture = settings.dungeon.floor;
			tempRoom.fillType = 2;
			tempRoom.fillColor = settings.dungeon.floorColor !== "" ? settings.dungeon.floorColor : "#000000";
			tempRoom.id = reservedId;
			reservedId++;
			tempRoom.x = sceneGrid;
			tempRoom.y = sceneGrid;
			tempRoom.width = Number(scene.data.width)*1.5 - sceneGrid*2;
			tempRoom.height = Number(scene.data.height)*1.5 - sceneGrid*2;
			tempRoom.strokeWidth = 0;
			drawings.push(tempRoom);
		}
		for (var a=0; a<rooms; a++){
			var tempRoom = IncarnateSceneGen.drawingObject();
			var forceContinue = 0;
			do{
				tempRoom.type = "r";
				tempRoom.flags = {
					type:"room",
					walls:[],
					regular:true
				}
				tempRoom.fillColor= settings.dungeon.roomColor !== "" ? settings.dungeon.roomColor : "#ffbe7d";
				tempRoom.fillType= settings.dungeon.room === "" ? 1 : 2;
				tempRoom.texture = settings.dungeon.room;
				tempRoom.strokeWidth = 0;
				tempRoom.id = dunId;
				tempRoom.x = Math.floor(sceneWidth * Math.random() / sceneGrid) * sceneGrid + sceneBorderWidth;
				tempRoom.y = Math.floor(sceneHeight * Math.random() / sceneGrid) * sceneGrid + sceneBorderHeight;
				tempRoom.height = Math.ceil(((roomMaxL - roomMinL) * Math.random() + roomMinL) /sceneGrid) * sceneGrid;
				tempRoom.width = Math.ceil(((roomMaxL - roomMinL) * Math.random() + roomMinL)/ sceneGrid) * sceneGrid;
				rollCount += 4;
				forceContinue++;
				var roomDrawings = drawings.filter(room => room.flags.type === "room");
				var checkCollide = IncarnateSceneGen.checkCollide(tempRoom,roomDrawings,0);
			}while(forceContinue<breakAfter && checkCollide);
			if (forceContinue < breakAfter) drawings.push(tempRoom);
			dunId++;
		}
		var rooms = drawings.filter(drawing => drawing.flags.type === "room");
		var roomsParsed = [];
		rooms.forEach(room =>{
			var preppedRoom = IncarnateSceneGen.parseDrawingLocation(room);
			preppedRoom.id = room.id;
			roomsParsed.push(preppedRoom);
		});
		var path = IncarnateSceneGen.drawingObject();
		path.flags={type:"path",roomsParsed:[]};
		path.type="p";
		path.id = reservedId;
		path.strokeAlpha = 0;
		reservedId++;
		var trackPoint = [0,0];
		var distanceOff = 10000000;
		var searchPoint;
		while (roomsParsed.length > 0){
			var tempTrackPoint;
			for (var a=0; a<roomsParsed.length; a++){
				var distance = Math.sqrt(Math.pow((trackPoint[0]-roomsParsed[a].center[0]),2)+Math.pow((trackPoint[1]-roomsParsed[a].center[1]),2));
				if (distance < distanceOff && distance > sceneGrid){
					tempTrackPoint = roomsParsed[a].center;
					distanceOff = distance;
					searchPoint = a;
				}
			}
			trackPoint = tempTrackPoint;
			path.flags.roomsParsed.push(roomsParsed[searchPoint]);
			path.points.push(trackPoint);
			roomsParsed.splice(searchPoint,1);
			distanceOff = 1000000;
		}
		drawings.push(path);
		var pathLen = path.flags.roomsParsed.length -1;
		for (var a=0; a<pathLen; a++){
			var room1 = path.flags.roomsParsed.find(drawing => drawing.id === path.flags.roomsParsed[a].id);
			var room2 = path.flags.roomsParsed.find(drawing => drawing.id === path.flags.roomsParsed[a+1].id);
			var tempHall = IncarnateSceneGen.drawingObject();
			tempHall.flags = {
				type:"hall",
				walls:[],
				regular:true
			};
			tempHall.type="r";
			tempHall.id = hallId;
			hallId++;
			tempHall.fillColor = settings.dungeon.hallColor !== "" ? settings.dungeon.hallColor : "#ffbe7d";
			tempHall.fillType = settings.dungeon.hall === "" ? 1 : 2;
			tempHall.texture = settings.dungeon.hall;
			tempHall.strokeWidth = 0;
			if (room1.top >= room2.top && room1.top + hallWidth <= room2.bottom){
				tempHall.y = Math.round(((room2.bottom - hallWidth - room1.top) * Math.random() + room1.top)/sceneGrid) * sceneGrid;
				tempHall.height = hallWidth;
				if (room1.left < room2.left){
					tempHall.x = room1.right;
					tempHall.width = room2.left - room1.right;
				}else{
					tempHall.x = room2.right;
					tempHall.width = room1.left - room2.right;
				}
			}else if (room1.bottom - hallWidth >= room2.top && room1.bottom <= room2.bottom){
				tempHall.y = Math.round(((room1.bottom - hallWidth - room2.top) * Math.random() + room2.top)/sceneGrid) * sceneGrid;
				tempHall.height = hallWidth;
				if (room1.left < room2.left){
					tempHall.x = room1.right;
					tempHall.width = room2.left - room1.right;
				}else{
					tempHall.x = room2.right;
					tempHall.width = room1.left - room2.right;
				}
			}else if (room1.top <= room2.top && room1.bottom >= room2.bottom){
				tempHall.y = Math.round(((room2.bottom - hallWidth - room2.top) * Math.random() + room2.top)/sceneGrid) * sceneGrid;
				tempHall.height = hallWidth;
				if (room1.left < room2.left){
					tempHall.x = room1.right;
					tempHall.width = room2.left - room1.right;
				}else{
					tempHall.x = room2.right;
					tempHall.width = room1.left - room2.right;
				}
			}else if (room1.left >= room2.left && room1.left + hallWidth <= room2.right){
				tempHall.x = Math.round(((room2.right - hallWidth - room1.left) * Math.random() + room1.left)/sceneGrid) * sceneGrid;
				tempHall.width = hallWidth;
				if (room1.top < room2.top){
					tempHall.y = room1.bottom;
					tempHall.height = room2.top - room1.bottom;
				}else{
					tempHall.y = room2.bottom;
					tempHall.height = room1.top - room2.bottom;
				}
			}else if (room1.right - hallWidth >= room2.left && room1.right <= room2.right){
				tempHall.x = Math.round(((room1.right - hallWidth - room2.left) * Math.random() + room2.left)/sceneGrid) * sceneGrid;
				tempHall.width = hallWidth;
				if (room1.top < room2.top){
					tempHall.y = room1.bottom;
					tempHall.height = room2.top - room1.bottom;
				}else{
					tempHall.y = room2.bottom;
					tempHall.height = room1.top - room2.bottom;
				}
			}else if(room1.left < room2.left && room1.right > room2.right){
				tempHall.x = Math.round(((room2.right - hallWidth - room2.left) * Math.random() + room2.left)/sceneGrid) * sceneGrid;
				tempHall.width = hallWidth;
				if (room1.top < room2.top){
					tempHall.y = room1.bottom;
					tempHall.height = room2.top - room1.bottom;
				}else{
					tempHall.y = room2.bottom;
					tempHall.height = room1.top - room2.bottom;
				}
			}else {
				var tempY = JSON.parse(JSON.stringify(tempHall));
				tempY.id = hallId;
				hallId++;
				tempHall.height = hallWidth;
				tempY.width = hallWidth;
				if (room1.left < room2.left){
					tempHall.x = room1.right;
					tempHall.width = room2.left - room1.right + hallWidth;
					if (room1.top < room2.top){
						tempHall.y = room1.bottom - hallWidth;
					}else{
						tempHall.y = room1.top;
					}
				}else{
					tempHall.x = room2.right;
					tempHall.width = room1.left - room2.right + hallWidth;
					if (room2.top < room1.top){
						tempHall.y = room2.bottom - hallWidth;
					}else{
						tempHall.y = room2.top;
					}
				}
				if (room1.top < room2.top){
					tempY.y = room1.bottom;
					tempY.height = room2.top - room1.bottom;
					if (room1.left < room2.left){
						tempY.x = tempHall.x + tempHall.width - hallWidth;
					}else{
						tempY.x = tempHall.x + tempHall.width - hallWidth;
					}
				}else{
					tempY.y = room2.bottom;
					tempY.height = room1.top - room2.bottom;
					if (room1.left < room2.left){
						tempY.x = tempHall.x + tempHall.width - hallWidth;
					}else{
						tempY.x = tempHall.x + tempHall.width - hallWidth;
					}
				}
				if (tempY.height > 0) drawings.push(tempY);
			}
			if (tempHall.x > 10 && tempHall.y > 10 && tempHall.width > 0) drawings.push(tempHall);
		}
		return ({drawings:drawings});
	}
	static dungeonWalls(drawings){
		const settings = game.settings.get("incarnate","incSceneGenSettings");
		var walls = [];
		const rooms = drawings.filter(drawing => drawing.flags.type ==="room");
		const halls = drawings.filter(drawing => drawing.flags.type ==="hall");
		const roomsParsed =[];
		rooms.forEach(room=>{
		 	 roomsParsed.push(IncarnateSceneGen.parseDrawingLocation(room));
		});
		const hallsParsed =[];
		halls.forEach(hall=>{
		 	 hallsParsed.push(IncarnateSceneGen.parseDrawingLocation(hall));
		});
		const path = drawings.find(drawing => drawing.flags.type ==="path");
		var wallId = 1;
		for (var a=0; a<walls.length; a++){
			if (walls[a].id > wallId) wallId = walls[a].id;
		}
		for (var room=0; room<rooms.length; room++){
			var flagWalls = rooms[room].flags.walls;
			/* used to remove walls
			for (var flagWall in flagWalls){
				const target = walls.findIndex(wall => wall.id === flagWalls[flagWall]);
				if (target !== -1) walls.splice(target,1);
			}
			*/
			flagWalls = [];
			const rectangleWalls = IncarnateSceneGen.rectangleWalls(rooms[room].x,rooms[room].y,rooms[room].width,rooms[room].height,wallId,hallsParsed,null,null,roomsParsed);
			wallId = rectangleWalls.id;
			walls = walls.concat(rectangleWalls.walls);
			for (var wall=0; wall < rectangleWalls.walls.length; wall++){
				flagWalls.push(rectangleWalls.walls[wall].id);
			}
		}
		const roomHallsParsed = roomsParsed.concat(hallsParsed);
		for (var hall=0; hall<halls.length; hall++){
			var flagWalls = halls[hall].flags.walls;
			/*
			for (var flagWall in flagWalls){
				const target = walls.findIndex(wall => wall.id === flagWalls[flagWall]);
				if (target !== -1) walls.splice(target,1);
			}
			*/
			flagWalls = [];
			const rectangleHalls = IncarnateSceneGen.rectangleHalls(halls[hall].x,halls[hall].y,halls[hall].width,halls[hall].height,wallId,[],undefined,undefined,roomHallsParsed);
			wallId = rectangleHalls.id;
			walls = walls.concat(rectangleHalls.walls);
			for (var wall=0; wall<rectangleHalls.walls.length; wall++){
				flagWalls.push(rectangleHalls.walls[wall].id);
			}
		}
		var wallLen = walls.length;
		for (var a = 0; a < wallLen-1; a++){
			for (var b = a+1; b < wallLen; b++){
				//check for duplicate
				if (walls[a].c[0] === walls[b].c[0] && walls[a].c[1] === walls[b].c[1] && walls[a].c[2] === walls[b].c[2] && walls[a].c[3] === walls[b].c[3]){
					//console.log(walls[a],walls[b]);
					if(walls[a].flags.loc === walls[b].flags.loc){
						walls[b].flags.duplicate = true;
					}else{
						walls[a].flags.duplicate = true;
						walls[b].flags.duplicate = true;
					}
				}
			}
		}
		/*
		for (var a=0; a<wallLen; a++){
			if (walls[a].flags.duplicate !== undefined){
				walls.splice(a,1);
				a--;
				wallLen = walls.length;
			}
		}
		*/
		for (var a = 0; a < wallLen-1; a++){
			for (var b = a+1; b < wallLen; b++){
				//fix extension
				if (walls[a].door === walls[b].door && walls[a].move === walls[b].move && walls[a].sense === walls[b].sense){
					if (walls[a].c[0] === walls[a].c[2] && walls[a].c[0] === walls[b].c[0] && walls[b].c[0] === walls[b].c[2]){
						if (walls[a].c[1] === walls[b].c[1] || walls[a].c[3] === walls[b].c[3] || walls[a].c[1] === walls[b].c[3] || walls[a].c[3] === walls[b].c[1]){
							var yPoints = [walls[a].c[1],walls[a].c[3],walls[b].c[1],walls[b].c[3]];
							yPoints.sort((a,b) => a-b);
							walls[a].c[1] = yPoints[0];
							walls[a].c[3] = yPoints[3];
							walls.splice(b,1);
							a = a-1 < 0 ? 0 : a-1;
							b = b-1 < 0 ? 0 : b-1;
							wallLen = walls.length;
						}
					}else if (walls[a].c[1] === walls[a].c[3] && walls[a].c[1] === walls[b].c[1] && walls[b].c[1] === walls[b].c[3]){
						if ((walls[a].c[0] === walls[b].c[0]) || (walls[a].c[2] === walls[b].c[2]) || (walls[a].c[0] === walls[b].c[2]) || (walls[a].c[2] === walls[b].c[0])){
							var xPoints = [walls[a].c[0],walls[a].c[2],walls[b].c[0],walls[b].c[2]];
							xPoints.sort((a,b) => a-b);
							walls[a].c[0] = xPoints[0];
							walls[a].c[2] = xPoints[3];
							walls.splice(b,1);
							a = a-1 < 0 ? 0 : a-1;
							b = b-1 < 0 ? 0 : b-1;
							wallLen = walls.length;
						}
					}
				}
			}
		}
		return {drawings:drawings,walls:walls};
	}
	static dungeonTraceWalls(walls,drawings){
		drawings = drawings.filter(drawing => drawing.flags === undefined || drawing.flags.type === undefined || drawing.flags.type !== "wall");
		var id = 1;
		drawings.forEach(drawing => id = drawing.id > id ? drawing.id : id); 
		function test(wall){
			return wall.used === undefined && wall.sense === 1 && wall.move === 1 && (wall.door === 0 || wall.door === 2);
		}
		var wallOutline = [];
		var clonedWalls = JSON.parse(JSON.stringify(walls));
		var wallLen = walls.length;
		for (var a=0; a<wallLen; a++){
			var wall = clonedWalls[a];
			if (test(wall)){
				var points = [[wall.c[0],wall.c[1]],[wall.c[2],wall.c[3]]];
				wall.used = true;
				var currentPoint = [wall.c[2],wall.c[3]];
				var startPoint = [wall.c[0],wall.c[1]];
				var abortCount = 0;
				do{
					abortCount++;
					var found = false;
					for (var b=0; b<wallLen; b++){
						if (test(clonedWalls[b])){
							if (clonedWalls[b].c[0] === currentPoint[0] && clonedWalls[b].c[1] === currentPoint[1]){
								currentPoint = [clonedWalls[b].c[2],clonedWalls[b].c[3]];
								points.push(currentPoint);
								found = true;
								clonedWalls[b].used = true;
								break;
							}else if (clonedWalls[b].c[2] === currentPoint[0] && clonedWalls[b].c[3] === currentPoint[1]){
								currentPoint = [clonedWalls[b].c[0],clonedWalls[b].c[1]];
								points.push(currentPoint);
								found = true;
								clonedWalls[b].used = true;
								break;
							}
						}
					}
				}while ((found === true && ((currentPoint[0] !== startPoint[0] && currentPoint[1] !== startPoint[1])||(currentPoint[0] === startPoint[0] && currentPoint[1] !== startPoint[1])||(currentPoint[0] !== startPoint[0] && currentPoint[0] === startPoint[0])))&& abortCount < 50);
				var left = 1000000000, top = 1000000000, right = 0, bottom = 0;
				points.forEach(point => {
					left = left < point[0] ? left : point[0];
					top = top < point[1] ? top : point[1];
					right = right > point[0] ? right : point[0];
					bottom = bottom > point[1] ? bottom : point[1];
				});
				const newDrawing = IncarnateSceneGen.drawingObject();
				newDrawing.flags.type = "wall";
				newDrawing.type = "p";
				newDrawing.x = left;
				newDrawing.y = top;
				newDrawing.width = right - left;
				newDrawing.height = bottom - top;
				id++;
				newDrawing.id = id;
				points.forEach(point => {
					newDrawing.points.push([point[0]-left,point[1]-top]);
				});
				drawings.push(newDrawing);
			}else if (wall.used === undefined && wall.sense === 1 && wall.move === 1 && wall.door === 1){
			}
		}
		return {drawings:drawings,walls:walls};
	}
	static dungeonRoomDesc(drawings,notes){
		var id = 1;
		notes.forEach(note => {id = note.id > id ? note.id : id});
		const path = drawings.find(drawing => drawing.flags.type === "path");
		var note = {};
		if (path !== undefined){
			console.log("Waypoint 1");
			const pathLen = path.flags.roomsParsed.length;
			//Set first room on path to entrance
			var currentRoom = drawings.find(drawing => drawing.id === path.flags.roomsParsed[0].id)
			if (currentRoom !== undefined && currentRoom.flags.note === undefined){
				note = IncarnateSceneGen.newNote(currentRoom,id);
				currentRoom.flags.note = id;
				id++;
				note.flags.template="Q6l2NFgPnN1in4vL",
				note.flags.templateName="Cave Entrance"
				note.icon = "icons/svg/door-exit.svg";
				notes.push(note);
			}
			//Set second to last room on path to boss
			currentRoom = drawings.find(drawing => drawing.id === path.flags.roomsParsed[pathLen-2].id)
			if (currentRoom !== undefined && currentRoom.flags.note === undefined){
				note = IncarnateSceneGen.newNote(currentRoom,id);
				currentRoom.flags.note = id;
				id++;
				note.flags.template="Q6PL8n85Rh2eGLNm",
				note.flags.templateName="Cave Boss Chamber"
				note.icon = "icons/svg/skull.svg";
				notes.push(note);
			}
			//Set last room on path to treasure
			currentRoom = drawings.find(drawing => drawing.id === path.flags.roomsParsed[pathLen-1].id)
			if (currentRoom !== undefined && currentRoom.flags.note === undefined){
				note = IncarnateSceneGen.newNote(currentRoom,id);
				currentRoom.flags.note = id;
				id++;
				note.flags.template="Q70b7Naw3dWkJsqA",
				note.flags.templateName="Cave Treasure Chamber"
				note.icon = "icons/svg/ice-aura.svg";
				notes.push(note);
			}
		}
		//Set all other rooms to normal rooms
		const otherRooms = drawings.filter(drawing => drawing.flags.type !== undefined && drawing.flags.type === "room");
		otherRooms.forEach(currentRoom =>{
			if (currentRoom !== undefined && currentRoom.flags.note === undefined){
				note = IncarnateSceneGen.newNote(currentRoom,id);
				currentRoom.flags.note = id;
				id++;
				notes.push(note);
			}else if (currentRoom !== undefined){
				notes = IncarnateSceneGen.moveNote(currentRoom,notes);
			}
		});
		return {drawings:drawings,notes:notes};
	}
	static moveNote (drawing,notes){
		const note = notes.find(thisNote => thisNote.id === drawing.flags.note);
		if (note !== undefined){
			note.x= Number(drawing.x) + (Number(drawing.width)/2);
			note.y= Number(drawing.y) + (Number(drawing.height)/2);
		}
		return notes;
	}
	static newNote(drawing,id){
		return{
			entryId:"AAAAAAAAAAAAAAAA",
			flags:{
				tempType:"Dungeons",
				template:"Q6ZQjy8GHootEcak",
				templateName:"Cave Chamber",
				room:drawing.id
			},
			icon: "icons/svg/cave.svg",
			id: id,
			x: Number(drawing.x) + (Number(drawing.width)/2),
			y: Number(drawing.y) + (Number(drawing.height)/2)
		}
	}
	/*
	 * colisionDrawings are an array of drawings that any overlaps need to be handled differently than an opaque wall
	 * colisionType: {door:0,flags:{},move:1,:sense:1}
	 * colisionDrawingsSkip: skips any walls that would enter into the zone of one of these drawings.
	 */
	static rectangleWalls(x,y,width,height,startId,colisionDrawings,colisionType,normalType,colisionDrawingsSkip){
		x = width > 0 ? x : x + width;
		y = height > 0 ? y : y + height;
		width = Math.abs(width);
		height = Math.abs(height);
		colisionType = colisionType || {door:1,flags:{},move:1,sense:1};
		normalType = normalType || {door:0,flags:{},move:1,sense:1};
		var walls=[];
		var wallId = startId + 1;
		var tempWall = [x,y,x+width,y];
		var colisionCycle = IncarnateSceneGen.wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,"top");
		walls = walls.concat(colisionCycle.walls);
		wallId = colisionCycle.id;
		tempWall = [x,y,x,y+height];
		var colisionCycle = IncarnateSceneGen.wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,"left");
		walls = walls.concat(colisionCycle.walls);
		wallId = colisionCycle.id;
		tempWall = [x+width,y,x+width,y+height];
		var colisionCycle = IncarnateSceneGen.wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,"right");
		walls = walls.concat(colisionCycle.walls);
		wallId = colisionCycle.id;
		tempWall = [x,y+height,x+width,y+height];
		var colisionCycle = IncarnateSceneGen.wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,"bottom");
		walls = walls.concat(colisionCycle.walls);
		wallId = colisionCycle.id;
		return {walls:walls,id:wallId};
	}
	static rectangleHalls(x,y,width,height,startId,colisionDrawings,colisionType,normalType,colisionDrawingsSkip){
		x = width > 0 ? x : x + width;
		y = height > 0 ? y : y + height;
		width = Math.abs(width);
		height = Math.abs(height);
		colisionType = colisionType || {door:1,flags:{},move:1,sense:1};
		normalType = normalType || {door:0,flags:{},move:1,sense:1};
		var walls=[];
		var wallId = startId + 1;
		var tempWall = [x,y,x+width,y];
		var colisionCycle = IncarnateSceneGen.wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,"top");
		walls = walls.concat(colisionCycle.walls);
		wallId = colisionCycle.id;
		tempWall = [x,y,x,y+height];
		var colisionCycle = IncarnateSceneGen.wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,"left");
		walls = walls.concat(colisionCycle.walls);
		wallId = colisionCycle.id;
		tempWall = [x+width,y,x+width,y+height];
		var colisionCycle = IncarnateSceneGen.wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,"right");
		walls = walls.concat(colisionCycle.walls);
		wallId = colisionCycle.id;
		tempWall = [x,y+height,x+width,y+height];
		var colisionCycle = IncarnateSceneGen.wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,"bottom");
		walls = walls.concat(colisionCycle.walls);
		wallId = colisionCycle.id;
		return {walls:walls,id:wallId};
	}
	static wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,position){
		var walls = [];
		var colisions = IncarnateSceneGen.wallColision(tempWall,[],colisionDrawingsSkip);
		if (colisions.primary.length === 0 && colisions.secondary.length <= 1){
			var newWall = JSON.parse(JSON.stringify(normalType));
			newWall.c = tempWall;
			newWall.id = wallId;
			newWall.flags.loc = position;
			wallId++;
			walls.push(newWall);
		}else{
			var postSkips = IncarnateSceneGen.wallColisionSkip(tempWall,colisions.secondary,position);
			postSkips.forEach(post => {
				var newWall = JSON.parse(JSON.stringify(normalType));
				newWall.c = post;
				newWall.id = wallId;
				newWall.flags.loc = position;
				wallId++;
				walls.push(newWall);
			});
		}
		return {walls:walls,id:wallId};
	}
	static wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,position){
		var walls = [];
		var colisions = IncarnateSceneGen.wallColision(tempWall,colisionDrawings,colisionDrawingsSkip,position);
		if (colisions.primary.length === 0 && colisions.secondary.length <= 1){
			var newWall = JSON.parse(JSON.stringify(normalType));
			newWall.c = tempWall;
			newWall.id = wallId;
			newWall.flags.loc = position;
			wallId++;
			walls.push(newWall);
		}else{
			var postSkips = IncarnateSceneGen.wallColisionSkip(tempWall,colisions.secondary,position);
			postSkips.forEach(post => {
				var colisionTran = IncarnateSceneGen.wallColisionTransform(post,colisions.primary,wallId,normalType,colisionType,position);
				walls = walls.concat(colisionTran.walls);
				wallId =colisionTran.id;
			});
		}
		return {walls:walls,id:wallId};
	}
	static wallColisionTransform([x1,y1,x2,y2],colisions,wallId,normalType,colisionType,position){
		normalType = normalType || {door:0,flags:{},move:1,sense:1};
		colisionType = colisionType || {door:1,flags:{},move:1,sense:1};
		var newWall;
		const walls = [];
		if (x1 === x2){
			var yCurrent = y1 < y2 ? y1 : y2;
			var yEnd = y1 > y2 ? y1 : y2;
			colisions.sort((a,b) => a.top - b.top);
			colisions.forEach(colision =>{
				if (colision.top > yCurrent && colision.top <= yEnd && colision.top !== yCurrent){
					newWall = JSON.parse(JSON.stringify(normalType));
					newWall.c = [x1,yCurrent,x1,colision.top];
					newWall.id = wallId;
					newWall.flags.loc = position;
					wallId++;
					walls.push(newWall);
					yCurrent = colision.top;
				}else if (colision.top > yEnd && yEnd !== yCurrent){
					newWall = JSON.parse(JSON.stringify(normalType));
					newWall.c = [x1,yCurrent,x1,yEnd];
					newWall.id = wallId;
					newWall.flags.loc = position;
					wallId++;
					walls.push(newWall);
					yCurrent = yEnd;
				}
				if ((position === "left" && colision.left === x1)||(position ==="right" && colision.right === x1)){
				}else{
					newWall = JSON.parse(JSON.stringify(colisionType));
					var yTemp = colision.bottom >= yEnd ? yEnd :
						colision.bottom > yCurrent ? colision.bottom : yCurrent;
					if (yTemp !== yCurrent){
						newWall.c = [x1,yCurrent,x1,yTemp];
						newWall.id = wallId;
						newWall.flags.loc = position;
						wallId++;
						walls.push(newWall);
						yCurrent = yTemp;
					}
				}
			});
			if (yCurrent < yEnd){
				newWall = JSON.parse(JSON.stringify(normalType));
				newWall.c = [x1,yCurrent,x1,yEnd];
				newWall.id = wallId;
				newWall.flags.loc = position;
				wallId++;
				walls.push(newWall);
			}
		}else if (y1 === y2){
			var xCurrent = x1 < x2 ? x1 : x2;
			var xEnd = x1 > x2 ? x1 : x2;
			colisions.sort((a,b) => a.left - b.left);
			colisions.forEach(colision =>{
				if (colision.left > xCurrent && colision.left <= xEnd && xCurrent !== colision.left){
					newWall = JSON.parse(JSON.stringify(normalType));
					newWall.c = [xCurrent,y1,colision.left,y1];
					newWall.id = wallId;
					newWall.flags.loc = position;
					wallId++;
					walls.push(newWall);
					xCurrent = colision.left;
				}else if (colision.left > xEnd && xCurrent !== xEnd){
					newWall = JSON.parse(JSON.stringify(normalType));
					newWall.c = [xCurrent,y1,xEnd,y1];
					newWall.id = wallId;
					newWall.flags.loc = position;
					wallId++;
					walls.push(newWall);
					xCurrent = xEnd;
				}
				if ((position ==="top" && colision.top ===y1)||(position==="bottom" && colision.bottom === y1)){
				}else{
					newWall = JSON.parse(JSON.stringify(colisionType));
					var xTemp = colision.right >= xEnd ? xEnd :
						colision.right > xCurrent? colision.right : xCurrent;
					if (xTemp !== xCurrent){
						newWall.c = [xCurrent,y1,xTemp,y1];
						newWall.id = wallId;
						newWall.flags.loc = position;
						wallId++;
						walls.push(newWall);
						xCurrent = xTemp;
					}
				}
			});
			if (xCurrent < xEnd){
				newWall = JSON.parse(JSON.stringify(normalType));
				newWall.c = [xCurrent,y1,xEnd,y1];
				newWall.id = wallId;
				newWall.flags.loc = position;
				wallId++;
				walls.push(newWall);
			}
		}else{
		}
		return {walls:walls,id:wallId};
	}
	static wallColisionSkip([x1,y1,x2,y2],colisions,position){
		var a = [], encompassSelf = false, skipPart = false;
		if (colisions.length === 1){
			a.push([x1,y1,x2,y2]);
		}else if (x1 === x2){
			var yCurrent = y1 < y2 ? y1 : y2;
			var yStart = yCurrent;
			var yEnd = y1 > y2 ? y1 : y2;
			colisions.sort((a,b) => a.top - b.top);
			colisions.forEach(colision =>{
				if ((colision.top < yStart && colision.bottom >= yEnd)||(colision.top <= yStart && colision.bottom > yEnd)){
					encompassSelf = true;
				}else if (colision.top > yCurrent){
					if ((position ==="left" && colision.left === x1)||(position ==="right" && colision.right === x1)){
					}else{
						var yTemp = colision.top < yEnd ? colision.top : yEnd;
						a.push([x1,yCurrent,x1,yTemp]);
						skipPart = true;
						yCurrent = colision.bottom < yEnd ? colision.bottom : yEnd;
					}
				}else if(colision.top === yStart && colision.bottom === yEnd){
					if ((position ==="left" && colision.right === x1)||(position ==="right" && colision.left === x1)){
						yCurrent = colision.bottom < yEnd ? colision.bottom : yEnd;
					}
				}else if (colision.top <= yCurrent){
					if ((position ==="left" && colision.left === x1)||(position ==="right" && colision.right === x1)){
					}else{
					yCurrent = colision.bottom >= yEnd ? yEnd : 
						colision.bottom > yCurrent ? colision.bottom : yCurrent;
					}
				}
			});
			if (yCurrent < yEnd) a.push([x1,yCurrent,x1,yEnd]);
		}else if (y1 === y2){
			var xCurrent = x1 < x2 ? x1 : x2;
			var xStart = xCurrent;
			var xEnd = x1 > x2 ? x1 : x2;
			colisions.sort((a,b) => a.left - b.left);
			colisions.forEach(colision =>{
				if ((colision.left < xStart && colision.right >= xEnd)||(colision.left <= xStart && colision.right > xEnd)){
					encompassSelf = true;
				}else if (colision.left > xCurrent){
					if ((position === "top" && colision.top === y1)||(position === "bottom" && colision.bottom === y1)){
					}else{
						var xTemp = colision.left < xEnd ? colision.left : xEnd;
						a.push([xCurrent,y1,xTemp,y1]);
						skipPart = true;
						xCurrent = colision.right < xEnd ? colision.right : xEnd;
					}
				}else if (colision.left === xStart && colision.right === xEnd){
					if ((position === "bottom" && colision.top ===y1)||(position === "top" && colision.bottom === y1)){
						xCurrent = colision.right < xEnd ? colision.right : xEnd;
					}
				}else if (colision.left <= xCurrent){
					if ((position === "top" && colision.top === y1)||(position === "bottom" && colision.bottom === y1)){
					}else{
					xCurrent = colision.right >= xEnd ? xEnd :
						colision.right > xCurrent ? colision.right : xCurrent;
					}
				}
			});
			if (xCurrent < xEnd) a.push([xCurrent,y1,xEnd,y1]);
		}else{
		}
		if (encompassSelf === true){
			a = [];
		}else if (a.length === 0 && skipPart === true){
			a.push([x1,y1,x2,y2]);
		}
		return a;
	}
	static wallColision ([x1,y1,x2,y2],colisionPrimary,colisionSecondary){
		const top = y1 < y2 ? y1 : y2;
		const bottom = y1 > y2 ? y1 : y2;
		const left = x1 < x2 ? x1 : x2;
		const right = x1 > x2 ? x1 : x2;
		const primary = [];
		const secondary =[];
		const col1 = colisionPrimary || [];
		const col2 = colisionSecondary || [];
		if (y1 === y2){
			for (var a=0; a<col1.length; a++){
				if (col1[a].top <= y1 && col1[a].bottom >= y1 && ((col1[a].left >= left && col1[a].left <= right)||(col1[a].right >= left && col1[a].right <= right)||(col1[a].left <= left && col1[a].right >= right))){
					primary.push(col1[a])
				}
			}
			for (var a=0; a<col2.length; a++){
				if (col2[a].top <= y1 && col2[a].bottom >= y1 && ((col2[a].left >= left && col2[a].left <= right)||(col2[a].right >= left && col2[a].right <= right)||(col2[a].left <= left && col2[a].right >= right))){
					secondary.push(col2[a])
				}
			}
		}else if (x1 == x2){
			for (var a=0; a<col1.length; a++){
				if(col1[a].left <= x1 && col1[a].right >= x1 && ((col1[a].top >= top && col1[a].top <= bottom)||(col1[a].bottom >= top && col1[a].bottom <= bottom)||(col1[a].top <= top && col1[a].bottom >= bottom))){
					primary.push(col1[a]);
				}
			}
			for (var a=0; a<col2.length; a++){
				if(col2[a].left <= x1 && col2[a].right >= x1 && ((col2[a].top >= top && col2[a].top <= bottom)||(col2[a].bottom >= top && col2[a].bottom <= bottom)||(col2[a].top <= top && col2[a].bottom >= bottom))){
					secondary.push(col2[a]);
				}
			}
		}else {
		}
		return ({primary:primary,secondary:secondary});
	}
	static makePolygon (id,x,y,sceneId,minA,maxA,minL,maxL){
		id = Number(id) || 1;
		x = Number(x) || 300;
		y = Number(y) || 300;
		minA = Number(minA) > 90 ? 0:
			Number(minA) < 0 ? 0 : 
			Number(Number(minA)/180*Math.PI)? Number(Number(minA)/180*Math.PI) : 0;
		maxA = Number(maxA) > 90 ? Math.PI/2:
			Number(maxA) < 0 ? Math.PI/2:
			Number(Number(maxA)/180*Math.PI)? Number(Number(maxA)/180*Math.PI) : Math.PI/2;
		console.log(minA*180/Math.PI,maxA*180/Math.PI);
		minL = Number(minL) || 50;
		maxL = Number(maxL) || 200;
		const user = game.userId;
		sceneId = sceneId || game.scenes.active.data._id;
		const scene = game.scenes.get(sceneId);
		console.log(scene);
		var drawing = IncarnateSceneGen.drawingObject();
		drawing.flags = {walls:[]};
		drawing.type = "p";
		drawing.fillColor="#004000";
		drawing.id=id;
		drawing.x=x;
		drawing.y=y;
		drawing.points.push([0,0]);
		const pointOrigin = [0,0];
		const width = scene.data.width * 1.2, height = scene.data.height * 1.2;
		var currentAngle = Math.PI /2 + this.angle(minA,maxA);
		var currentLength = this.length(minL,maxL);
		var tempX = Math.cos(currentAngle) * currentLength;
		var tempY = Math.sin(currentAngle) * currentLength;
		tempX = (tempX + x) < 0 ? 0-x :
			(tempX + x) > width -x ? width : tempX;
		tempY = (tempY + y) < 0 ? 0-y :
			(tempY + y) > height -y ? height : tempY;
		var previousPoint1 = [tempX,tempY];
		const secondPoint = [tempX,tempY];
		var previousAngle = currentAngle;
		drawing.points.push([tempX,tempY]);
		currentAngle = 5/4*Math.PI;
		do{
			currentAngle = previousAngle - this.angle(minA,maxA);
			var currentLength = this.length(minL,maxL);
			var tempX = Math.cos(currentAngle) * currentLength + previousPoint1[0];
			var tempY = Math.sin(currentAngle) * currentLength + previousPoint1[1];
			tempX = (tempX + x) < 0 ? 0-x :
				(tempX + x) > width -x ? width : tempX;
			tempY = (tempY + y) < 0 ? 0-y :
				(tempY + y) > height -y ? height : tempY;
			console.log(tempX,tempY);
			if (tempX > secondPoint[0]){
				if (currentAngle < -Math.PI/2){
					if (tempX > pointOrigin[0] && tempY < pointOrigin[1]){
						drawing.points.push([tempX,tempY]);
						previousPoint1 = [tempX,tempY];
					}
				}else {
					drawing.points.push([tempX,tempY]);
					previousPoint1 = [tempX,tempY];
				}
			}
			previousAngle = currentAngle;
		}while (currentAngle > -Math.PI);
		console.log(drawing.points);
		var maxX=0, minX=0, maxY=0, minY=0;
		drawing.points.forEach(point => {
			if (point[0] > maxX) maxX = point[0];
			if (point[0] < minX) minX = point[0];
			if (point[1] > maxY) maxY = point[1];
			if (point[1] < minY) minY = point[1];
		});
		drawing.height = Math.ceil(maxY - minY);
		drawing.width = Math.ceil(maxX - minX);
		const drawings = [drawing];
		console.log(drawings);
		game.scenes.active.update({drawings:drawings});
	}
	static angle (minA, maxA){
		rollCount++;
		return (maxA - minA) * Math.random() + minA
	}
	static length (minL, maxL){
		rollCount++;
		return (maxL - minL) * Math.random() + minL
	}
	static checkCollide (drawing,drawings,allowance){
		allowance = allowance || 0;
		const drawingLen = drawings.length;
		const parsedDrawing = IncarnateSceneGen.parseDrawingLocation(drawing);
		for (var drawingLenVar = 0; drawingLenVar < drawingLen; drawingLenVar++){
			const drawParse = IncarnateSceneGen.parseDrawingLocation(drawings[drawingLenVar]);
			if ((((drawParse.left - allowance >= parsedDrawing.left)&&(drawParse.left + allowance <= parsedDrawing.right))||((drawParse.right - allowance >= parsedDrawing.left)&&(drawParse.right + allowance <= parsedDrawing.right)))&&(((drawParse.top - allowance >= parsedDrawing.top)&&(drawParse.top + allowance <= parsedDrawing.bottom))||((drawParse.bottom - allowance >= parsedDrawing.top)&&(drawParse.bottom + allowance <= parsedDrawing.bottom)))){
				return true;
			}else if ((((parsedDrawing.left - allowance >= drawParse.left)&&(parsedDrawing.left + allowance <= drawParse.right))||((parsedDrawing.right - allowance >= drawParse.left)&&(parsedDrawing.right + allowance <= drawParse.right)))&&(((parsedDrawing.top - allowance >= drawParse.top)&&(parsedDrawing.top + allowance <= drawParse.bottom))||((parsedDrawing.bottom - allowance >= drawParse.top)&&(parsedDrawing.bottom + allowance <= drawParse.bottom)))){
				return true;
			}else if (drawParse.top < parsedDrawing.top && drawParse.bottom > parsedDrawing.bottom && drawParse.left > parsedDrawing.left && drawParse.right < parsedDrawing.right){
				return true;
			}else if (drawParse.top > parsedDrawing.top && drawParse.bottom < parsedDrawing.bottom && drawParse.left < parsedDrawing.left && drawParse.right > parsedDrawing.right){
				return true;
			}
		}
		return false;
	}
	static parseDrawingLocation(drawing){
		const result = {};
		if (drawing.type === "e" || drawing.type ==="r"){
			result.top = Number(drawing.height) > 0 ? Number(drawing.y) : Number(drawing.y) + Number(drawing.height);
			result.left = Number(drawing.width) > 0 ? Number(drawing.x) : Number(drawing.width) + Number(drawing.x);
			result.bottom = Number(drawing.height) > 0 ? Number(drawing.y) + Number(drawing.height) : Number (drawing.y);
			result.right = Number(drawing.width) > 0 ? Number(drawing.x) + Number(drawing.width) : Number(drawing.x);
			result.center = [Number(result.left) + (Number(result.right)-Number(result.left))/2,Number(result.top) + (Number(result.right)-Number(result.left))/2];
		}else if (drawing.type === "p" || drawing.type ==="f"){
			result.top = Number(drawing.height) > 0 ? Number(drawing.y) : Number(drawing.y) + Number(drawing.height);
			result.left = Number(drawing.width) > 0 ? Number(drawing.x) : Number(drawing.width) + Number(drawing.x);
			result.bottom = Number(drawing.height) > 0 ? Number(drawing.y) + Number(drawing.height) : Number (drawing.y);
			result.right = Number(drawing.width) > 0 ? Number(drawing.x) + Number(drawing.width) : Number(drawing.x);
			result.center = [Number(result.left) + (Number(result.right)-Number(result.left))/2,Number(result.top) + (Number(result.right)-Number(result.left))/2];
		}else{
			console.log("Cannot parse drawings of type: ",drawing.type);
			return(false);
		}
		return result;
	}
}
class IncarnateWindowMemory{
	static incarnateSetupDefaults(){
		game.settings.register("incarnate","incWindowMemory", {
			name: "Remembers Key Window Sizes",
			hint: "Tracks the size of a few very important windows.",
			default: "",
			type: Object,
			scope: 'world',
			onChange: settings => {
				console.log(settings);
			}
		});
		if( game.settings.get("incarnate","incWindowMemory") !=""){
			return(game.settings.get("incarnate","incWindowMemory"));
		}else {
			console.log("Creating Window Memory Settings");
			var tempWindow = IncarnateWindowMemory.defaultArray();
			game.settings.set("incarnate","incWindowMemory",tempWindow);
			return(tempWindow);
		}
	}
	static defaultArray(){
		return {
			gmScreen:{
				width:250,
				height:300,
				left:400,
				top:286
			}
		}
	}
	static resetDefault(){
		console.log("Creating Window Memory Settings");
		var tempWindow = IncarnateWindowMemory.defaultArray();
		game.settings.set("incarnate","incWindowMemory",tempWindow);
		return(tempWindow);
	}
}
class IncarnateMainSettings{
	static incarnateSetupDefaults(){
		var array = IncarnateMainSettings.defaultArrayAnvil();
		game.settings.register(array.module,array.key,array);
		array = IncarnateMainSettings.defaultAutoKill();
		game.settings.register(array.module,array.key,array);
		array = IncarnateMainSettings.defaultArrayRegion();
		game.settings.register(array.module,array.key,array);
		array = IncarnateMainSettings.defaultArraySceneTabs();
		game.settings.register(array.module,array.key,array);
		return true;
	}
	static defaultArray(){
		return{
			config:true,
			default:true,
			module:"incarnateWorldBuilding",
			scope:"client",
			type: Boolean
		}
	}
	static resetDefault(){
		var array = IncarnateMainSettings.defaultArrayAnvil();
		game.settings.set(array.module,array.key,array.default);
		array = IncarnateMainSettings.defaultAutoKill();
		game.settings.set(array.module,array.key,array.default);
		array = IncarnateMainSettings.defaultArrayRegion();
		game.settings.set(array.module,array.key,array.default);
		array = IncarnateMainSettings.defaultArraySceneTabs();
		game.settings.set(array.module,array.key,array.default);
		return true;
	}
	static defaultAutoKill(){
		const array = IncarnateMainSettings.defaultArray();
		array.name = "Auto Kill";
		array.hint = "When an actor in the active scene is reduced to 0 hp check if it is in combat tracker and if so mark it as dead. If an actor is raised above 0 hp mark it as alive.";
		array.key = "autoKill";
		return array;
	}
	static defaultArrayAnvil(){
		const array = IncarnateMainSettings.defaultArray();
		array.name = "Anvil Buttons";
		array.hint = "Turns anvil buttons on.";
		array.key = "anvilButtons";
		return array;
	}
	static defaultArrayRegion(){
		const array = IncarnateMainSettings.defaultArray();
		array.name="Current Region";
		array.hint="Remembers the current region to set properties to match and add generated data to that folder";
		array.key="incRegions";
		array.config=false;
		array.default={};
		array.scope="world";
		array.type=Object;
		return array;
	}
	static defaultArraySceneTabs(){
		const array = IncarnateMainSettings.defaultArray();
		array.name = "Scene Tabs";
		array.hint = "Changes the scene config to a tabbed view and adds a flag tab.";
		array.key = "sceneTabs";
		return array;
	}
}
class IncarnateSceneConfig{
	static changeSceneConfig(app,html,data){
		if (html[0].tagName === "FORM") return false;
		var htmlDom = this.createSceneTabs(app,html,data);
		htmlDom = this.applyTabListeners(htmlDom);
		htmlDom = this.addFlags(htmlDom,data);
		htmlDom.style.height = "unset";
	}
	static addFlags(htmlDom,data){
		var flags = data.entity.flags;
		if (flags === undefined){
			flags = IncarnateSceneGen.defaultArray();
		}
		var dungeon = flags.dungeon;
		if (dungeon === undefined){
			dungeon = IncarnateSceneGen.defaultArray().dungeon;
		}
		const nav = htmlDom.getElementsByTagName("nav")[0];
		nav.innerHTML += this.newNav("Incarnate Scene Flags",'<i class="fas fa-flag"></i>').outerHTML;
		const form = htmlDom.getElementsByTagName("form")[0];
		const buttons = form.getElementsByTagName("button");
		const button = buttons[buttons.length -1];
		const newTab = this.newTab("Incarnate Scene Flags");
		newTab.innerHTML =`
		<div class="form-group">
			<label>Trace Walls</label>
			<input type="checkbox" name="flags.dungeon.traceWalls" data-dtype="Boolean"${dungeon.traceWalls ? " checked" : ""}/>
			<p class="notes">Causes room and wallways to be outlined with a black line</p>
		</div>
		<div class="form-group">
			<label>Hall Width</label>
			<input type="Number" name="flags.dungeon.hallWidth" data-dtype="Number" value="${dungeon.hallWidth > 0 ? dungeon.hallWidth : 0}"/>
		</div>
		<div class="form-group">
			<label>Place Room Description Generators</label>
			<input type="checkbox" name="flags.dungeon.roomDesc" data-dtype="Boolean"${dungeon.roomDesc ? " checked" : ""}/>
			<p class="notes">Places a room description generator in the center of each room.</p>
		</div>
		<div class="form-group">
			<label>Random Encounters</label>
			<input type="checkbox" name="flags.dungeon.randEnc" data-dtype="Boolean"${dungeon.randEnc ? " checked" : ""}/>
			<p class="notes">Places hidden monsters inside any room that has its description generated.</p>
		</div>
		`;
		form.insertBefore(newTab,button);
		return htmlDom
	}
	static applyTabListeners(htmlDom){
		//listener to make tabs work
		let nav = $('.tabs[data-group="sceneTabs"]');
		new Tabs(nav, {
			initial: "Appearance",
			callback: t => console.log("Tab ${t} was clicked")
		});
		return htmlDom;
	}
	static createSceneTabs(app,html,data){
		const flags = data.entity.flags;
		const htmlDom = html[0];
		if (htmlDom === undefined) return true;
		var form = htmlDom.getElementsByTagName("form")[0];
		const children = form.children;
		var pastHeader = false;
		const newForm = document.createElement("form");
		newForm.setAttribute("autocomplete",form.getAttribute("autocomplete"));
		const tabs = document.createElement("div");
		const nav = document.createElement("nav");
		const buttons = form.getElementsByTagName("button");
		const button = buttons[buttons.length -1];
		const submitButton = button.outerHTML;
		button.remove();
		nav.setAttribute("class","tabs");
		nav.setAttribute("data-group","sceneTabs");
		var currentTab = "";
		[].forEach.call(children, child =>{
			if (pastHeader === false){
				if (child.tagName === "H3"){
					pastHeader = true
					var sanName = IncarnateReference.sanitizeName(child.textContent);
					nav.innerHTML += this.newNav(sanName,child.firstChild.outerHTML).outerHTML;
					currentTab = this.newTab(sanName);
				}else{
					newForm.innerHTML += child.outerHTML;
				}
			}else{
				if (child.tagName === "H3"){
					tabs.innerHTML += currentTab.outerHTML;
					var sanName = IncarnateReference.sanitizeName(child.textContent);
					nav.innerHTML += this.newNav(sanName,child.firstChild.outerHTML).outerHTML;
					currentTab = this.newTab(sanName);
				}else{
					currentTab.innerHTML += child.outerHTML;
				}
			}
		});
		tabs.append(currentTab);
		//form = newForm;
		form.innerHTML = newForm.innerHTML;
		form.innerHTML += nav.outerHTML;
		form.innerHTML += tabs.innerHTML;
		form.innerHTML += submitButton;
		return htmlDom;
	}
	static newTab(sanName){
		const currentTab = document.createElement("div");
		currentTab.setAttribute("class","tab " + sanName.replace(/ /g,""));
		currentTab.setAttribute("data-tab",sanName.replace(/ /g,""));
		currentTab.setAttribute("data-group","sceneTabs");
		return currentTab;
	}
	//logo is in the format <i class="fas fa-image"></i>
	static newNav(sanName,logo){
		var newNav = document.createElement("a");
		newNav.setAttribute("class","item");
		newNav.setAttribute("data-tab",sanName.replace(/ /g,""));
		newNav.setAttribute("title",sanName);
		newNav.innerHTML = logo;
		return newNav;
	}
}
class IncarnateAutoKill{
	static autoKill(token,data,hp){
		const actorUpdate = hp !== undefined ? true : false;
		var id = actorUpdate ? token.data.id : data.id;
		var combToken = undefined;
		hp = hp !== undefined ? hp : data.actorData["data.attributes.hp.value"];
		if (game.combat !== undefined){
			combToken = game.combat.data.combatants.find(comb => comb.tokenId === id);
		}
		if ((token.data.overlayEffect === "icons/svg/skull.svg" || actorUpdate) && hp >= 1){
			data.overlayEffect = "";
			if (combToken !== undefined){
				game.combat.updateCombatant({id:combToken.id,defeated:false});
			}
			if (actorUpdate === true){
				token.update(game.scenes.active.data._id,{overlayEffect:""});
			}
		}else if (hp === 0){
			data.overlayEffect = "icons/svg/skull.svg";
			if (combToken !== undefined){
				game.combat.updateCombatant({id:combToken.id,defeated:true});
			}
			if (actorUpdate === true){
				token.update(game.scenes.active.data._id,{overlayEffect:"icons/svg/skull.svg"});
			}
		}
	}
}
class IncarnateWorldItems{
	static setupFlags(constructor,data){
		if (!data.flags){
			data.flags = {};
		}
		data.flags.incarnateWorldBuilding = {
		};
	}
}
CONFIG.maxCanvasZoom = 10;
