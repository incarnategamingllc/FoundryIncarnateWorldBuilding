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
        folder.addEventListener("change", IncarnateGamingLLC.GMsScreen.addDropDown)
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
    IncarnateGamingLLC.GMsScreen.addDropDown(undefined,form.getElementsByClassName("templateType")[0])
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
