Hooks.on("preUpdateActor",(actor,data)=>{
    console.log('preUpdateActor', actor, data)
    if(game.settings.get("incarnateWorldBuilding","autoKill") === false) return true;
    if (!data || !data.data || !data.data.attributes || !data.data.attributes.hp || !(typeof data.data.attributes.hp.value === 'number')) return true;
    IncarnateGamingLLC.AutoKill.autoKill(actor, data, data.data.attributes.hp.value);
});
