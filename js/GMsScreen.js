IncarnateGamingLLC.openGmScreen = function() {
    if (ui._incGMScreen === undefined){
        ui._incGMScreen = new IncarnateGamingLLC.GMsScreen();
    }
    ui._incGMScreen.render(true);
}
/**
 * Creates a GMsScreen to assist in accessing custom Incarnate functions
 * @type {IncarnateGamingLLC.GMsScreen}
 */
IncarnateGamingLLC.GMsScreen = class GMsScreen extends FormApplication {

    /**
     * Define default options for the PartySummary application
     */
    static get defaultOptions() {
        const options = super.defaultOptions;
        let settings = game.settings.get("incarnateWorldBuilding","incWindowMemory");
        options.width = settings.gmScreen.width;
        options.height = settings.gmScreen.height;
        options.top = settings.gmScreen.top;
        options.left = settings.gmScreen.left;
        options.template = "modules/incarnateWorldBuilding/templates/incarnateGMScreen.html";
        options.classes = ["incarnate-gms-screen", "app", "window-app", "form"]
        options.resizable = true;
        options.submitOnChange = true;
        options.submitOnClose = true;
        options.closeOnSubmit = false;
        return options;
    }
    /* -------------------------------------------- */
    async close(options) {
        console.log('gm screen is closing');
        let settings = game.settings.get("incarnateWorldBuilding","incWindowMemory");
        settings.gmScreen = this.position;
        game.settings.set("incarnateWorldBuilding","incWindowMemory",settings);
        super.close(options);
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
        for (var b=0;b<folderLen; b++){
            if (folders[b].type === "JournalEntry"){
                templateData.folder.push({
                    "name":folders[b].name,
                    "value":folders[b]._id
                });
            }
        }
        var referenceCalendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        templateData.referenceCalendar=referenceCalendar;
        templateData.month=referenceCalendar.monthNames[referenceCalendar.date.m-1];
        if (templateData.referenceCalendar.date.i < 10){
            templateData.referenceCalendar.date.i = "0" + templateData.referenceCalendar.date.i;
        }
        if (templateData.referenceCalendar.date.s < 10){
            templateData.referenceCalendar.date.s = "0" + templateData.referenceCalendar.date.s;
        }
        templateData.title="GM's Screen";
        templateData.sceneGenSettings = game.settings.get("incarnateWorldBuilding","incSceneGenSettings");
        templateData.statRollSettings = game.settings.get("incarnateWorldBuilding","incStatRoll");
        console.log(templateData);
        return templateData;
    }
    static async addDropDown (ev,srcElement){
        var preSelect = srcElement || ev.srcElement;
        var mySelect = preSelect.options[preSelect.selectedIndex].text;
        var select = preSelect.parentElement.parentElement.getElementsByClassName("templatePosition")[0];
        select.innerHTML = "";
        const incarnateTemplates = await IncarnateGamingLLC.Reference.loadIncarnateTemplates();
        var templateLen = incarnateTemplates.length;
        for (var a=0; a<templateLen;a++){
            if (incarnateTemplates[a].flags.templateType === mySelect){
                var option = document.createElement("option"),
                    tempName = incarnateTemplates[a].name;
                if (tempName.search(/class="generate"/)!==-1){
                    tempName = tempName.replace(/ ?-? ?<span class="generate".*<\/span> ?-? ?/,"")
                }
                tempName= IncarnateGamingLLC.Reference.sanitizeName(tempName);
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
                StatRoll.addToFolder(folder);
            }
        }
        game.settings.set("incarnateWorldBuilding","incRegions",settings);
    }

    static mainTabCallback(nullElement, tabsV2, newTabName){
    }

    static dungeonTabCallback(nullElement, tabsV2, newTabName){
    }
    /**
     * Add some event listeners to the UI to provide interactivity
     */
    activateListeners(html){
        super.activateListeners(html);
        const htmlDom = $(html)[0];
        if (htmlDom === undefined) return true;

        //listener for region change
        let regionFolder = $(html)[0].getElementsByClassName("incarnate-journalListing")[0];
        regionFolder.addEventListener("change",IncarnateGamingLLC.GMsScreen.setRegion);
        //listener for folder change
        let templateFolder = htmlDom.getElementsByClassName("templateType");
        [].forEach.call(templateFolder, folder =>{
            folder.addEventListener("change",IncarnateGamingLLC.GMsScreen.addDropDown)
        });
        IncarnateGamingLLC.GMsScreen.addDropDown(undefined,htmlDom.getElementsByClassName("templateType")[0]);
        let addLeast = htmlDom.getElementsByClassName("atLeast-create");
        [].forEach.call(addLeast, add=>{
            add.addEventListener("click",IncarnateGamingLLC.GMsScreen.addLeast);
        });
        let deleteLeast = htmlDom.getElementsByClassName("atLeast-delete");
        [].forEach.call(deleteLeast, setting=>{
            setting.addEventListener("click",IncarnateGamingLLC.GMsScreen.deleteLeast);
        });
        let addMost = htmlDom.getElementsByClassName("atMost-create");
        [].forEach.call(addMost, add=>{
            add.addEventListener("click",IncarnateGamingLLC.GMsScreen.addMost);
        });
        let deleteMost = htmlDom.getElementsByClassName("atMost-delete");
        [].forEach.call(deleteMost, setting=>{
            setting.addEventListener("click",IncarnateGamingLLC.GMsScreen.deleteMost);
        });
        let generateForest = htmlDom.getElementsByClassName("generateForest");
        [].forEach.call(generateForest, add=>{
            add.addEventListener("click", IncarnateGamingLLC.ForestGenerator.newForest);
        });
        let generateDungeon = htmlDom.getElementsByClassName("generateDungeon");
        [].forEach.call(generateDungeon, add=>{
            add.addEventListener("click", IncarnateGamingLLC.DungeonGenerator.newDungeon);
        });
        let handlerResetMapSettings = async () =>{
            await IncarnateGamingLLC.SceneGen.resetDefault();
            ui._incGMScreen.render(false);
        }
        let resetMapSettings = htmlDom.getElementsByClassName("resetMapSettings");
        [].forEach.call(resetMapSettings, add=>{
            add.addEventListener("click",handlerResetMapSettings);
        });
        
        //listener to make main tabs work
        const mainTabs = new TabsV2({navSelector: ".tabs", contentSelector: ".content", initial: "tab1", callback: IncarnateGamingLLC.GMsScreen.mainTabCallback});
        mainTabs.bind(htmlDom);

        //listener to make scene tabs work
        const dungeonTabs = new TabsV2({navSelector: ".dungeonTabs", contentSelector: ".dungeonTabContent", initial: "tab1", callback: IncarnateGamingLLC.GMsScreen.dungeonTabCallback});
        dungeonTabs.bind(htmlDom);

        //listener to make Insert Template work
        let insertTemplate = htmlDom.getElementsByClassName("insertTemplateButton");
        [].forEach.call(insertTemplate, button => {
            button.addEventListener("click", IncarnateGamingLLC.Reference.templateInsert);
        });
    }
    static async addLeast(){
        const settings = game.settings.get("incarnateWorldBuilding","incStatRoll");
        console.log(settings);
        IncarnateGamingLLC.pushObjectIntoObject(settings.guarantee.atLeast, {value:0, quantity:0});
        await game.settings.set("incarnateWorldBuilding","incStatRoll",settings);
        ui._incGMScreen.render(true);
    }
    static async deleteLeast(ev){
        const id = IncarnateGamingLLC.Reference.getClosestClass(ev.srcElement,"atLeast-entry").getAttribute("data-id");
        const settings = game.settings.get("incarnateWorldBuilding","incStatRoll");
        delete settings.guarantee.atLeast[id];
        await game.settings.set("incarnateWorldBuilding","incStatRoll",settings);
        ui._incGMScreen.render(true);
    }
    static async addMost(){
        const settings = game.settings.get("incarnateWorldBuilding","incStatRoll");
        IncarnateGamingLLC.pushObjectIntoObject(settings.guarantee.atMost, {value:0, quantity:0});
        await game.settings.set("incarnateWorldBuilding","incStatRoll",settings);
        ui._incGMScreen.render(true);
    }
    static async deleteMost(ev){
        const id = IncarnateGamingLLC.Reference.getClosestClass(ev.srcElement,"atMost-entry").getAttribute("data-id");
        const settings = game.settings.get("incarnateWorldBuilding","incStatRoll");
        delete settings.guarantee.atMost[id];
        await game.settings.set("incarnateWorldBuilding","incStatRoll",settings);
        ui._incGMScreen.render(true);
    }
    async _updateObject(event, formData) {
        console.log(event, formData);
        let expandedObject = expandObject(formData, 5);
        console.log(expandedObject);
        let originalStatRoll = game.settings.get("incarnateWorldBuilding", "incStatRoll");
        let originalSceneGen = game.settings.get("incarnateWorldBuilding", "incSceneGenSettings");
        game.settings.set("incarnateWorldBuilding","incStatRoll",mergeObject(originalStatRoll, expandedObject.statRollSettings));
        game.settings.set("incarnateWorldBuilding","incSceneGenSettings",mergeObject(originalSceneGen,expandedObject.sceneGenSettings));
    }
}
