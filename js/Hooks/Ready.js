Hooks.on('ready', () =>  {
    if (game.settings.get("incarnateWorldBuilding","anvilButtons")){
        let anvil = document.getElementById("logo")
        if ( game.user.isGM ) {
            anvil.addEventListener('click', IncarnateGamingLLC.openGmScreen);
        }else{
        }
        anvil.addEventListener('dragover', IncarnateGamingLLC.Anvil.incarnateOnDragOver);
        anvil.addEventListener('drop', IncarnateGamingLLC.Anvil.incarnateOnDrop);
        // anvil.ondragover = ev => IncarnateGamingLLC.Anvil.incarnateOnDragOver();
        // anvil.ondrop = ev => IncarnateGamingLLC.Anvil.incarnateOnDrop();
    }
    IncarnateGamingLLC.Calendar.incarnateSetupCalendar();
    IncarnateGamingLLC.StatRoll.incarnateSetupDefaults();
    IncarnateGamingLLC.SceneGen.incarnateSetupDefaults();
    IncarnateGamingLLC.WindowMemory.incarnateSetupDefaults();
    IncarnateGamingLLC.ImportTables.import();
    //Adds a preRender hook to applications
    const IncarnateApplicationRender = (function () {
        var cached_function = Application.prototype._render;
        return async function(emptyApp){
            let resume = await Hooks.call("preRender"+this.constructor.name,this);
            if (resume === false){
                return new Promise(resolve => null);
            }else{
                return cached_function.apply(this, arguments);
            }
        }
    })();
    Application.prototype._render = IncarnateApplicationRender;
    //Changes Note double left to different script
    const IncarnateNoteDoubleLeft = (function () {
        var cached_function = Note.prototype._onClickLeft2;
        return function(ev){
            const advance = Hooks.call("incarnateNoteDoubleLeft",ev,this);
            if (advance === false) return false;
            return cached_function.apply(this,arguments);
        }
    })();
    Note.prototype._onClickLeft2 = IncarnateNoteDoubleLeft;
});
