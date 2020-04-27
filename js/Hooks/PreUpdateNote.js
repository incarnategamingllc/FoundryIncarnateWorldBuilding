Hooks.on("preUpdateNote", (note,sceneId,formData)=> {
    if (formData["flags.tempType"] === " " || formData["flags.template"] == "" || formData["flags.template"] == undefined) return;
    const sanName = IncarnateGamingLLC.Reference.sanitizeName(formData["flags.template"].split("__")[1]);
    formData["flags.templateName"] = sanName;
    formData["flags.template"] = formData["flags.template"].split("__")[0];
    console.log(formData);
});
