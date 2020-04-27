Hooks.on('ready', async () =>  {
    if (game.settings.get("incarnateWorldBuilding","anvilButtons")){
        var anvil = document.getElementById("logo")
        if ( game.user.isGM ) {
            anvil.setAttribute("onclick","IncarnateGamingLLC.incarnateGMBlind()");
        }else{
        }
        anvil.ondragover = ev => IncarnateGamingLLC.Anvil.incarnateOnDragOver(event);
        anvil.ondrop = ev => IncarnateGamingLLC.Anvil.incarnateOnDrop(event);
    }
    IncarnateGamingLLC.Calendar.incarnateSetupCalendar();
    IncarnateGamingLLC.StatRoll.incarnateSetupDefaults();
    IncarnateGamingLLC.SceneGen.incarnateSetupDefaults();
    IncarnateGamingLLC.WindowMemory.incarnateSetupDefaults();
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
        var cached_function = Note.prototype._onDoubleLeft;
        return async function(ev){
            const advance = Hooks.callAll("incarnateNoteDoubleLeft",ev,this);
            if (advance === false) return false;
            return cached_function.apply(this,arguments);
        }
    })();
    Note.prototype._onDoubleLeft = IncarnateNoteDoubleLeft;
});
