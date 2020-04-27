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
