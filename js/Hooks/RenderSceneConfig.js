Hooks.on("renderSceneConfig",(app,html,data) => {
    console.log('renderSceneConfig');
    if (game.settings.get("incarnateWorldBuilding","sceneTabs")){
        let sceneConfig = new IncarnateGamingLLC.SceneConfig(app, html, data);
        sceneConfig.changeSceneConfig(app,html,data);
        return true;
    }else{
        return true;
    }
});
