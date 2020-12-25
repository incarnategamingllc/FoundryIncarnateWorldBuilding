Hooks.on("preUpdateActor",(actor,data)=>{
    if(game.settings.get("incarnateWorldBuilding","autoKill") === false) return true;
    if (data["data.attributes.hp.value"] === undefined) return true;
    const token = canvas.tokens.placeables.find(tok => tok.data.actorId === data._id);
    if (token !== undefined){
        IncarnateGamingLLC.AutoKill.autoKill(token,data,data["data.attributes.hp.value"]);
    }
    return true;
});
