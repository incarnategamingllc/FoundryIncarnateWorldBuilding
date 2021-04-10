Hooks.on("renderSceneConfig",(app,html,data) => {
    console.log('renderSceneConfig');
    if (game.settings.get("incarnateWorldBuilding","newSceneOptions")){
        let sceneConfig = new IncarnateGamingLLC.SceneConfig(app, html, data);
        sceneConfig.changeSceneConfig();
        if (game.settings.get("incarnateWorldBuilding","sceneTabs")){
            sceneConfig.addTabs();
        }
        return true;
    }else{
        return true;
    }
});
