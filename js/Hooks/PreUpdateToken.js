Hooks.on("preUpdateToken",(token,sceneId,data)=>{
    if (sceneId !== game.scenes.active.data._id) return true;
    if (data.actorData !== undefined && data.actorData["data.attributes.hp.value"] !== undefined){
        if(game.settings.get("incarnateWorldBuilding","autoKill")){
            const fullToken = canvas.tokens.get(token.id);
            IncarnateGamingLLC.AutoKill.autoKill(fullToken,data);
        }
    }
    return true;
});
