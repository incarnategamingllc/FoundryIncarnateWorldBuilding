/**
 *
 * @type {IncarnateGamingLLC.WindowMemory}
 */
IncarnateGamingLLC.WindowMemory = class WindowMemory{
    static incarnateSetupDefaults(){
        game.settings.register("incarnate","incWindowMemory", {
            name: "Remembers Key Window Sizes",
            hint: "Tracks the size of a few very important windows.",
            default: "",
            type: Object,
            scope: 'world',
            onChange: settings => {
                console.log(settings);
            }
        });
        if( game.settings.get("incarnateWorldBuilding","incWindowMemory") !=""){
            return(game.settings.get("incarnateWorldBuilding","incWindowMemory"));
        }else {
            console.log("Creating Window Memory Settings");
            var tempWindow = WindowMemory.defaultArray();
            game.settings.set("incarnateWorldBuilding","incWindowMemory",tempWindow);
            return(tempWindow);
        }
    }
    static defaultArray(){
        return {
            gmScreen:{
                width:250,
                height:300,
                left:400,
                top:286
            }
        }
    }
    static resetDefault(){
        console.log("Creating Window Memory Settings");
        var tempWindow = WindowMemory.defaultArray();
        game.settings.set("incarnateWorldBuilding","incWindowMemory",tempWindow);
        return(tempWindow);
    }
}
