/**
 *
 * @type {IncarnateGamingLLC.Settings}
 */
IncarnateGamingLLC.Settings = class Settings{
    static incarnateSetupDefaults(){
        var array = Settings.defaultArrayAnvil();
        game.settings.register(array.module,array.key,array);
        array = Settings.defaultAutoKill();
        game.settings.register(array.module,array.key,array);
        array = Settings.defaultArrayRegion();
        game.settings.register(array.module,array.key,array);
        array = Settings.defaultArraySceneTabs();
        game.settings.register(array.module,array.key,array);
        return true;
    }
    static defaultArray(){
        return{
            config:true,
            default:true,
            module:"incarnateWorldBuilding",
            scope:"client",
            type: Boolean
        }
    }
    static resetDefault(){
        var array = Settings.defaultArrayAnvil();
        game.settings.set(array.module,array.key,array.default);
        array = Settings.defaultAutoKill();
        game.settings.set(array.module,array.key,array.default);
        array = Settings.defaultArrayRegion();
        game.settings.set(array.module,array.key,array.default);
        array = Settings.defaultArraySceneTabs();
        game.settings.set(array.module,array.key,array.default);
        return true;
    }
    static defaultAutoKill(){
        const array = Settings.defaultArray();
        array.name = "Auto Kill";
        array.hint = "When an actor in the active scene is reduced to 0 hp check if it is in combat tracker and if so mark it as dead. If an actor is raised above 0 hp mark it as alive.";
        array.key = "autoKill";
        return array;
    }
    static defaultArrayAnvil(){
        const array = Settings.defaultArray();
        array.name = "Anvil Buttons";
        array.hint = "Turns anvil buttons on.";
        array.key = "anvilButtons";
        return array;
    }
    static defaultArrayRegion(){
        const array = Settings.defaultArray();
        array.name="Current Region";
        array.hint="Remembers the current region to set properties to match and add generated data to that folder";
        array.key="incRegions";
        array.config=false;
        array.default={};
        array.scope="world";
        array.type=Object;
        return array;
    }
    static defaultArraySceneTabs(){
        const array = Settings.defaultArray();
        array.name = "Scene Tabs";
        array.hint = "Changes the scene config to a tabbed view and adds a flag tab.";
        array.key = "sceneTabs";
        return array;
    }
}
