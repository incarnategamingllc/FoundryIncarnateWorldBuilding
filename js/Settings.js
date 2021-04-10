/**
 *
 * @type {IncarnateGamingLLC.Settings}
 */
IncarnateGamingLLC.Settings = class Settings{
    static incarnateSetupDefaults(){
        IncarnateGamingLLC.Settings.registerSetting(IncarnateGamingLLC.Settings.defaultObjectAnvil());
        IncarnateGamingLLC.Settings.registerSetting(IncarnateGamingLLC.Settings.defaultObjectAutoKill());
        IncarnateGamingLLC.Settings.registerSetting(IncarnateGamingLLC.Settings.defaultObjectChatMacros());
        IncarnateGamingLLC.Settings.registerSetting(IncarnateGamingLLC.Settings.defaultObjectJournalRevealSecrets());
        IncarnateGamingLLC.Settings.registerSetting(IncarnateGamingLLC.Settings.defaultObjectJournalQuests());
        IncarnateGamingLLC.Settings.registerSetting(IncarnateGamingLLC.Settings.defaultObjectRegion());
        IncarnateGamingLLC.Settings.registerSetting(IncarnateGamingLLC.Settings.defaultObjectNewSceneOptions());
        IncarnateGamingLLC.Settings.registerSetting(IncarnateGamingLLC.Settings.defaultObjectSceneTabs());
        return true;
    }
    static registerSetting(object){
        game.settings.register(object.module,object.key,object);
    }
    static defaultObject(){
        return{
            config:true,
            default:true,
            module:"incarnateWorldBuilding",
            scope:"client",
            type: Boolean
        }
    }
    static defaultObjectAnvil(){
        const object = Settings.defaultObject();
        object.name = "Anvil Buttons";
        object.hint = "Turns anvil buttons on.";
        object.key = "anvilButtons";
        return object;
    }
    static defaultObjectAutoKill(){
        const object = Settings.defaultObject();
        object.name = "Auto Kill";
        object.hint = "When an actor in the active scene is reduced to 0 hp check if it is in combat tracker and if so mark it as dead. If an actor is raised above 0 hp mark it as alive.";
        object.key = "autoKill";
        object.scope="world";
        return object;
    }
    static defaultObjectChatMacros(){
        const object = Settings.defaultObject();
        object.name = "Custom Chat Macros";
        object.hint = "Adds default Incarnate Chat Macros. Try '/help' for details.";
        object.key = "chatMacros";
        object.scope="world";
        return object;
    }
    static defaultObjectJournalRevealSecrets(){
        const object = Settings.defaultObject();
        object.name = "Journal Reveal Secrets";
        object.hint = "Gives owners the ability to reveal secrets on Journal Entries";
        object.key = "journalSecrets";
        object.scope="world";
        return object;
    }
    static defaultObjectJournalQuests(){
        const object = Settings.defaultObject();
        object.name = "Journal Quests";
        object.hint = "Adds a Quests section to Journal Entries";
        object.key = "journalQuests";
        object.scope="world";
        return object;
    }
    static defaultObjectRegion(){
        const object = Settings.defaultObject();
        object.name="Current Region";
        object.hint="Remembers the current region to set properties to match and add generated data to that folder";
        object.key="incRegions";
        object.config=false;
        object.default={};
        object.scope="world";
        object.type=Object;
        return object;
    }
    static defaultObjectSceneTabs(){
        const object = Settings.defaultObject();
        object.name = "Scene Tabs";
        object.hint = "CURRENTLY BROKEN. Changes the scene config to a tabbed view";
        object.key = "sceneTabs";
        object.default = false;
        return object;
    }
    static defaultObjectNewSceneOptions(){
        const object = Settings.defaultObject();
        object.name = "Nes Scene Options";
        object.hint = "Adds new scene options to configure map generation.";
        object.key = "newSceneOptions";
        return object;
    }
}
