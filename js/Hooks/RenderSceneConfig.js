Hooks.on("renderSceneConfig",(app,html,data) => {
    if (game.settings.get("incarnateWorldBuilding","sceneTabs")){
        IncarnateGamingLLC.SceneConfig.changeSceneConfig(app,html,data);
        return true;
    }else{
        return true;
    }
});
