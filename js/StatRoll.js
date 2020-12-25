/**
 *
 * @type {IncarnateGamingLLC.StatRoll}
 */
IncarnateGamingLLC.StatRoll = class StatRoll{
    //conversion script added on 9/13/2019 to add support for regional stat roll settings in older data sets
    static addToFolder(folder){
        var flags = IncarnateGamingLLC.deepCopy(folder.data.flags);
        var found = false;
        if (folder.data.parent !== null){
            const parentFolder = game.folders.get(folder.data.parent);
            if (parentFolder.data.flags.incRegions !== undefined){
                if (parentFolder.data.flags.incRegions.incStatRoll !== undefined){
                    flags.incRegions.incStatRoll = parentFolder.data.flgas.incRegions.incStatRoll;
                    found = true;
                }
            }
        }
        if (found === false){
            const worldStatRoll = game.settings.get("incarnateWorldBuilding","incStatRoll");
            flags.incRegions.incStatRoll = worldStatRoll;
        }
        folder.update({flags:flags});
    }
    static playerStatRoll(userId){
        const user = game.users.get(userId);
        const flags = IncarnateGamingLLC.deepCopy(user.data.flags);
        if (flags.statRolls === undefined){
            flags.statRolls = [];
        }
        const settings = game.settings.get("incarnateWorldBuilding","incStatRoll");
        const statRoll = StatRoll.statRoll(settings.dice,settings.guarantee,settings.rolls,settings.abortCountTrigger,settings.forceOrder);
        flags.statRolls.push({
            statRoll:statRoll,
            date: Date.now(),
            gameDay:IncarnateGamingLLC.Calendar.incarnateDate(),
            settings:settings
        });
        user.update({flags:flags});
        return statRoll;
    }
    static statAudit(userName){
        const user = game.users.entities.find(user => user.data.name === userName);
        if (user === undefined){
            console.log("User: ",userName," not found");
            return false;
        }
        const flags = user.data.flags;
        var message ="<h3>" + userName + "</h3>";
        if (flags.statRolls !== undefined){
            flags.statRolls.forEach(roll =>{
                message+= "<p><strong>" + new Date(roll.date).toDateString() + "</strong> " + IncarnateGamingLLC.Calendar.toDateString(roll.gameDay) + "</p><p>" + JSON.stringify(roll.statRoll) + "</p>";
            })
        }
        return message;
    }
    static statAuditHard(userName){
        const user = game.users.entities.find(user => user.data.name === userName);
        if (user === undefined){
            console.log("User: ",userName," not found");
            return false;
        }
        const flags = user.data.flags;
        var message ="<h3>" + userName + "</h3>";
        if (flags.statRolls !== undefined){
            flags.statRolls.forEach(roll =>{
                message+= "<p><strong>" + new Date(roll.date).toDateString() + "</strong> " + IncarnateGamingLLC.Calendar.toDateString(roll.gameDay) + "</p><p>" + JSON.stringify(roll.statRoll) + "</p>" + "<p><strong>Dice:</strong> " + JSON.stringify(roll.settings.dice) + "</p><p><strong>Guarantees</strong></p><p>" + JSON.stringify(roll.settings.guarantee) + "</p>";
            })
        }
        return message;
    }
    static statRoll(dice,guarantee,rolls,abortCountTrigger,forceOrder){
        abortCountTrigger = Number(abortCountTrigger) || 50;
        dice = dice || "4d6dl";
        guarantee = guarantee || StatRoll.incarnateStatRollDefaultArray();
        rolls = Number(rolls) || 6;
        forceOrder = forceOrder || false;
        var rolledArray = [];
        var abortCount = 0;
        do{
            rolledArray = Roll.simulate(dice,rolls);
            abortCount++;
            if (Number(dice.substr(0,1) > 0)){
                IncarnateGamingLLC.rollCount += (rolls * Number(dice.substr(0,1)));
            }else{
                IncarnateGamingLLC.rollCount += (rolls*3);
            }
            if (guarantee !== undefined){
                if (guarantee.max === undefined) guarantee.max = 10000;
                if (guarantee.min === undefined) guarantee.min = 0;
                for (var a=0; a<rolls; a++){
                    rolledArray[a] = rolledArray[a] > guarantee.max ? guarantee.max:
                        rolledArray[a] < guarantee.min ? guarantee.min : rolledArray[a];
                }
            }
        }while(StatRoll.statRollGuarantee(rolledArray,guarantee) === false && abortCount < abortCountTrigger);
        if (abortCount === abortCountTrigger) console.warn("Stat roll aborted after "+ abortCountTrigger + " rolls.");
        if (forceOrder === false){
            rolledArray = rolledArray.sort((a,b) => b-a);
        }
        return rolledArray;
    }
    static statRollGuarantee(rolledArray,guarantee){
        if (guarantee === undefined) return true;
        if (guarantee.atLeast !== undefined){
            if (guarantee.atLeast.length > 0){
                for (var a=0; a<guarantee.atLeast.length; a++){
                    var filteredStats = rolledArray.filter(stat => stat >= guarantee.atLeast[a].value);
                    if (filteredStats.length < guarantee.atLeast[a].quantity) return false;
                }
            }
        }
        if (guarantee.atMost !== undefined){
            if (guarantee.atMost.length > 0){
                for (var a=0; a<guarantee.atMost.length; a++){
                    var filteredStats = rolledArray.filter(stat => stat <= guarantee.atMost[a].value);
                    if (filteredStats.length < guarantee.atMost[a].quantity) return false;
                }
            }
        }
        if (guarantee.statSumMax !== undefined || guarantee.statSumMin !== undefined || guarantee.modSumMax !== undefined || guarantee.modSumMin !== undefined){
            var statTotal = 0;
            var modTotal = 0;
            for (var a=0; a<rolledArray.length; a++){
                statTotal += rolledArray[a];
                modTotal += StatRoll.incarnateStatConvert(rolledArray[a]);
            }
            console.log("Stat Sum: ",statTotal,"Mod Sum: ",modTotal);
            if (guarantee.statSumMax !== undefined){
                if (guarantee.statSumMax < statTotal) return false;
            }
            if (guarantee.statSumMin !== undefined){
                if (guarantee.statSumMin > statTotal) return false;
            }
            if (guarantee.modSumMax !== undefined){
                if (guarantee.modSumMax < modTotal) return false;
            }
            if (guarantee.modSumMin !== undefined){
                if (guarantee.modSumMin > modTotal) return false;
            }
        }
        return true;
    }
    static incarnateStatConvert(score){
        return Math.floor((score - 10) / 2);
    }
    static incarnateSetupDefaults(){
        game.settings.register("incarnate","incStatRoll", {
            name: "Stat Roll Options",
            hint: "Tracks defaults for automated stat rolling.",
            default: "",
            type: Object,
            scope: 'world',
            onChange: settings => {
                console.log(settings);
            }
        });
        if( game.settings.get("incarnateWorldBuilding","incStatRoll") !=""){
            return(game.settings.get("incarnateWorldBuilding","incStatRoll"));
        }else {
            console.log("Creating StatRoll Settings");
            var tempStatRoll = StatRoll.incarnateStatRollDefaultArray();
            game.settings.set("incarnateWorldBuilding","incStatRoll",tempStatRoll);
            return(tempStatRoll);
        }
    }
    static incarnateStatRollDefaultArray(){
        return {
            abortCountTrigger:50,
            dice:"4d6dl",
            rolls:6,
            forceOrder:false,
            guarantee:{
                max: 18,
                min: 6,
                atLeast:[
                    {value:15,quantity:1}
                ],
                atMost:[
                    {value:7, quantity:1}
                ],
                statSumMax:300,
                statSumMin:0,
                modSumMax:60,
                modSumMin:-60
            }
        }
    }
}
