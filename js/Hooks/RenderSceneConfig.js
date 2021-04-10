Hooks.on("renderSceneConfig",(app,html,data) => {
    let sceneConfig = new IncarnateGamingLLC.SceneConfig(app, html, data);
    if (game.settings.get("incarnateWorldBuilding","newSceneOptions")){
        sceneConfig.changeSceneConfig();
    }
    if (game.settings.get("incarnateWorldBuilding","sceneTabs")){
        sceneConfig.addTabs();
    }
    return true;
});
