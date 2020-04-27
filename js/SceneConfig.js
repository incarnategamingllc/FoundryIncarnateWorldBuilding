/**
 *
 * @type {IncarnateGamingLLC.SceneConfig}
 */
IncarnateGamingLLC.SceneConfig = class SceneConfig{
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
            flags = SceneGen.defaultArray();
        }
        var dungeon = flags.dungeon;
        if (dungeon === undefined){
            dungeon = SceneGen.defaultArray().dungeon;
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
                    var sanName = IncarnateGamingLLC.Reference.sanitizeName(child.textContent);
                    nav.innerHTML += this.newNav(sanName,child.firstChild.outerHTML).outerHTML;
                    currentTab = this.newTab(sanName);
                }else{
                    newForm.innerHTML += child.outerHTML;
                }
            }else{
                if (child.tagName === "H3"){
                    tabs.innerHTML += currentTab.outerHTML;
                    var sanName = IncarnateGamingLLC.Reference.sanitizeName(child.textContent);
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
