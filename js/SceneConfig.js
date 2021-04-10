/**
 *
 * @type {IncarnateGamingLLC.SceneConfig}
 */
IncarnateGamingLLC.SceneConfig = class SceneConfig{
    constructor(app, html, data) {
        this.app = app;
        this.html = html;
        this.htmlDom = html[0];
        this.data = data;
        this.flags = data.entity.flags;
        this.result = document.createElement('form');
        this.result.setAttribute('autocomplete', 'off');
        this.result.classList.add('incarnate-scene-config');
        this.nav = document.createElement('nav');
        this.nav.classList.add('scene-config-nav');
        this.nav.setAttribute('data-group', 'sceneTabs');
        this.tabContent = document.createElement('section');
        this.tabContent.classList.add('scene-config-content');
        this.oldForm = this.htmlDom.getElementsByTagName('form')[0];
        this.addFlags();
    }
    changeSceneConfig(){
        const buttons = this.oldForm.getElementsByTagName('button');
        const submitButton = buttons[buttons.length - 1];
        const dungeonSection = this.getDungeonSection();
        for(let a=[dungeonSection.length -1]; a> -1; a--){
            submitButton.parentElement.insertBefore(dungeonSection[a], submitButton);
        }
    }
    addTabs(){
        this.markSubmitButton();
        this.moveContent();
        this.result.prepend(this.tabContent);
        this.result.prepend(this.nav);
        this.oldForm.parentElement.prepend(this.result);
        this.activateEventListeners();
        let sceneConfig = IncarnateGamingLLC.findParentElementByClass(this.result, 'scene-sheet');
        if(sceneConfig){
            sceneConfig.style.height = 'unset';
        }
    }
    activateEventListeners(){
        const mainTabs = new TabsV2({navSelector: ".scene-config-nav", contentSelector: ".scene-config-content", initial: "DetailsandDimensions", callback: IncarnateGamingLLC.SceneConfig.sceneConfigTabCallback});
        mainTabs.bind(this.htmlDom);
    }
    static sceneConfigTabCallback(nullElement, tabsV2, newTabName){
    }
    markSubmitButton(){
        const buttons = this.oldForm.getElementsByTagName('button');
        buttons[buttons.length -1].classList.add('submit-button');
    }
    moveContent(){
        let children = this.oldForm.children;
        let currentTab;
        Array.from(children).forEach(child=>{
            if(child.tagName === 'HEADER'){
                let newNavPart = this.newNav(child.textContent, child.getElementsByTagName('i')[0].classList[1])
                if(currentTab){
                    this.tabContent.append(currentTab);
                    currentTab = this.newTab(child.textContent);
                }else{
                    newNavPart.classList.add('active');
                    currentTab = this.newTab(child.textContent);
                    currentTab.classList.add('active');
                }
                this.nav.append(newNavPart);
                child.remove();
            }else if(currentTab && !child.classList.contains('submit-button')){
                currentTab.append(child);
            }
        });
        if(currentTab){
            this.tabContent.append(currentTab);
        }
    }
    getDungeonSection(){
        let dungeonTab = document.createElement('div');
        dungeonTab.innerHTML = `
		<div class="form-group">
			<label>Trace Walls</label>
			<input type="checkbox" name="flags.dungeon.traceWalls" data-dtype="Boolean"${this.dungeon.traceWalls ? " checked" : ""}/>
			<p class="notes">Causes room and hallways to be outlined with a black line</p>
		</div>
		<div class="form-group">
			<label>Hall Width</label>
			<input type="Number" name="flags.dungeon.hallWidth" data-dtype="Number" value="${this.dungeon.hallWidth > 0 ? this.dungeon.hallWidth : 0}"/>
		</div>
		<div class="form-group">
			<label>Place Room Description Generators</label>
			<input type="checkbox" name="flags.dungeon.roomDesc" data-dtype="Boolean"${this.dungeon.roomDesc ? " checked" : ""}/>
			<p class="notes">Places a room description generator in the center of each room.</p>
		</div>
		<div class="form-group">
			<label>Random Encounters</label>
			<input type="checkbox" name="flags.dungeon.randEnc" data-dtype="Boolean"${this.dungeon.randEnc ? " checked" : ""}/>
			<p class="notes">Places hidden monsters inside any room that has its description generated.</p>
		</div>
        <header class="form-header">
            <h3 class="form-header"><i class="fas fa-dungeon"></i> Dungeons</h3>
        </header>
        `
        return dungeonTab.children;
    }
    addFlags(){
        if (this.flags === undefined){
            this.flags = IncarnateGamingLLC.SceneGen.defaultArray();
        }
        this.dungeon = this.flags.dungeon;
        if (this.dungeon === undefined){
            this.dungeon = IncarnateGamingLLC.SceneGen.defaultArray().dungeon;
        }
        return this.flags;
    }
    newTab(sanName){
        const currentTab = document.createElement("div");
        currentTab.setAttribute("class","scene-config-tab " + sanName.replace(/[ \r\n]/g,""));
        currentTab.setAttribute("data-tab",sanName.replace(/[ \r\n]/g,""));
        currentTab.setAttribute("data-group","sceneTabs");
        return currentTab;
    }
    newNav(sanName,logo){
        let newNav = document.createElement("a");
        newNav.setAttribute("class","item");
        newNav.setAttribute("data-tab",sanName.replace(/[ \r\n]/g,""));
        newNav.setAttribute("title",sanName.replace(/[\r\n]/g,""));
        newNav.innerHTML = `<i class="fas ${logo}"></i>`;
        return newNav;
    }
}
