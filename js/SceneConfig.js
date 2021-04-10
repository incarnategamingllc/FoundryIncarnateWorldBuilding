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
    }
    changeSceneConfig(){
        this.addFlags();
        this.moveSubmitButton();
        this.moveContent();
        this.addNewTabs();
        this.result.prepend(this.tabContent);
        this.result.prepend(this.nav);
        this.oldForm.parentElement.append(this.result);
        this.oldForm.remove();
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
    addNewTabs(){
        this.tabContent.append(this.getDungeonTab());
    }
    moveSubmitButton(){
        let buttons = this.oldForm.getElementsByTagName('button');
        let buttonsLength = buttons.length;
        this.result.append(buttons[buttonsLength - 1]);
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
            }else if(currentTab){
                currentTab.append(child);
            }
        });
        if(currentTab){
            this.tabContent.append(currentTab);
        }
    }
    getDungeonTab(){
        this.nav.append(this.newNav('Dungeons', 'fa-dungeon'));
        let dungeonTab = this.newTab('Dungeons');
        dungeonTab.innerHTML = `
		<div class="form-group">
			<label>Trace Walls</label>
			<input type="checkbox" name="flags.dungeon.traceWalls" data-dtype="Boolean"${this.dungeon.traceWalls ? " checked" : ""}/>
			<p class="notes">Causes room and wallways to be outlined with a black line</p>
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
        `
        return dungeonTab;
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
    // applyTabListeners(htmlDom){
    //     //listener to make tabs work
    //     let nav = $('.tabs[data-group="sceneTabs"]');
    //     new Tabs(nav, {
    //         initial: "Appearance",
    //         callback: t => console.log("Tab ${t} was clicked")
    //     });
    //     return htmlDom;
    // }
    // createSceneTabs(app,html,data){
    //     const flags = data.entity.flags;
    //     const htmlDom = html[0];
    //     if (htmlDom === undefined) return true;
    //     let form = htmlDom.getElementsByTagName("form")[0];
    //     const children = form.children;
    //     console.log(children);
    //     var pastHeader = false;
    //     const newForm = document.createElement("form");
    //     newForm.setAttribute("autocomplete",form.getAttribute("autocomplete"));
    //     const tabs = document.createElement("section");
    //     const nav = document.createElement("nav");
    //     const buttons = form.getElementsByTagName("button");
    //     const button = buttons[buttons.length -1];
    //     const submitButton = button.outerHTML;
    //     button.remove();
    //     nav.setAttribute("class","tabs");
    //     nav.setAttribute("data-group","sceneTabs");
    //     let currentTab = "";
    //     Array.from(children).forEach((child)=>{
    //     // [].forEach.call(children, child =>{
    //         if (pastHeader === false){
    //             if (child.tagName === "header"){
    //                 pastHeader = true;
    //                 var sanName = IncarnateGamingLLC.Reference.sanitizeName(child.textContent);
    //                 nav.append(this.newNav(sanName,child.firstChild.outerHTML));
    //                 currentTab = this.newTab(sanName);
    //             }else{
    //                 newForm.appendChild(child);
    //             }
    //         }else{
    //             if (child.tagName === "header"){
    //                 tabs.append(currentTab);
    //                 var sanName = IncarnateGamingLLC.Reference.sanitizeName(child.textContent);
    //                 nav.append(this.newNav(sanName,child.firstChild.outerHTML));
    //                 currentTab = this.newTab(sanName);
    //             }else{
    //                 currentTab.appendChild(child);
    //             }
    //         }
    //     });
    //     tabs.append(currentTab);
    //     //form = newForm;
    //     form.parentElement.prepend(nav);
    //     form.parentElement.append(newForm);
    //     form.parentElement.append(tabs);
    //     form.parentElement.append(IncarnateGamingLLC.createElementFromHTML(submitButton));
    //     form.remove();
    //     return htmlDom;
    // }
    newTab(sanName){
        const currentTab = document.createElement("div");
        currentTab.setAttribute("class","scene-config-tab " + sanName.replace(/[ \r\n]/g,""));
        currentTab.setAttribute("data-tab",sanName.replace(/[ \r\n]/g,""));
        currentTab.setAttribute("data-group","sceneTabs");
        return currentTab;
    }
    // //logo is in the format <i class="fas fa-image"></i>
    newNav(sanName,logo){
        let newNav = document.createElement("a");
        newNav.setAttribute("class","item");
        newNav.setAttribute("data-tab",sanName.replace(/[ \r\n]/g,""));
        newNav.setAttribute("title",sanName.replace(/[\r\n]/g,""));
        newNav.innerHTML = `<i class="fas ${logo}"></i>`;
        return newNav;
    }
}
