/**
 *
 * @type {IncarnateGamingLLC.WorldItems}
 */
IncarnateGamingLLC.WorldItems = class WorldItems{
    static setupFlags(constructor,data){
        if (!data.flags){
            data.flags = {};
        }
        data.flags.incarnateWorldBuilding = {
        };
    }
}
