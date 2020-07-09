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
IncarnateGamingLLC.GMsScreen = class GMsScreen extends Application {

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
        options.classes = ["incarnate-gms-screen", "app", "window-app"]
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
        const incarnateTemplates = await IncarnateGamingLLC.Reference.loadIncarnateTemplates();
        var templateLen = incarnateTemplates.length;
        for (var a=0; a<templateLen;a++){
            if (incarnateTemplates[a].flags.templateType == mySelect){
                var option = document.createElement("option"),
                    tempName = incarnateTemplates[a].name;
                if (tempName.search(/class="generate"/)!=-1){
                    tempName = tempName.replace(/ ?\-? ?<span class="generate".*<\/span> ?\-? ?/,"")
                }
                tempName= IncarnateGamingLLC.Reference.sanitizeName(tempName);
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
        //listener for stat settings change
        let statSetting = htmlDom.getElementsByClassName("statSetting");
        [].forEach.call(statSetting, setting=>{
            setting.addEventListener("change",IncarnateGamingLLC.GMsScreen.statSettingChange);
        });
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
        let updateCheckbox = htmlDom.getElementsByClassName("booleanSetting");
        [].forEach.call(updateCheckbox, setting=> {
            setting.addEventListener("click",IncarnateGamingLLC.GMsScreen.updateCheckbox);
        });
        //listeners for Map Generate Settings
        let sceneSetting = htmlDom.getElementsByClassName("sceneGenSetting");
        [].forEach.call(sceneSetting, setting=>{
            setting.addEventListener("change",IncarnateGamingLLC.GMsScreen.sceneSettingChange);
        });
        let generateForest = htmlDom.getElementsByClassName("generateForest");
        [].forEach.call(generateForest, add=>{
            add.addEventListener("click", IncarnateGamingLLC.ForestGenerator.newForest);
        });
        let generateDungeon = htmlDom.getElementsByClassName("generateDungeon");
        [].forEach.call(generateDungeon, add=>{
            add.addEventListener("click", IncarnateGamingLLC.DungeonGenerator.newDungeon);
        });
        let handlerResetMapSettings = async ev =>{
            IncarnateGamingLLC.SceneGen.resetDefault();
            await IncarnateGamingLLC.Reference.incarnateDelay(500);
            ui._gmblind.render(false);
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
    static async addLeast(ev){
        const settings = game.settings.get("incarnate","incStatRoll");
        settings.guarantee.atLeast.push({value:0, quantity:0});
        game.settings.set("incarnate","incStatRoll",settings);
        await IncarnateGamingLLC.Reference.incarnateDelay(50);
        ui._gmblind.render(true);
    }
    static async deleteLeast(ev){
        const id = IncarnateGamingLLC.Reference.getClosestClass(ev.srcElement,"atLeast-entry").getAttribute("data-id");
        const settings = game.settings.get("incarnate","incStatRoll");
        settings.guarantee.atLeast.splice(id,1);
        game.settings.set("incarnate","incStatRoll",settings);
        await IncarnateGamingLLC.Reference.incarnateDelay(50);
        ui._gmblind.render(true);
    }
    static async addMost(ev){
        const settings = game.settings.get("incarnate","incStatRoll");
        settings.guarantee.atMost.push({value:0, quantity:0});
        game.settings.set("incarnate","incStatRoll",settings);
        await IncarnateGamingLLC.Reference.incarnateDelay(50);
        ui._gmblind.render(true);
    }
    static async deleteMost(ev){
        const id = IncarnateGamingLLC.Reference.getClosestClass(ev.srcElement,"atMost-entry").getAttribute("data-id");
        const settings = game.settings.get("incarnate","incStatRoll");
        settings.guarantee.atMost.splice(id,1);
        game.settings.set("incarnate","incStatRoll",settings);
        await IncarnateGamingLLC.Reference.incarnateDelay(50);
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
