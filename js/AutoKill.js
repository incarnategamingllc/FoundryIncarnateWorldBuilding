/**
 * Creates logic to assist in automatically marking defeated
 * actors as being dead.
 * @type {IncarnateGamingLLC.AutoKill}
 */
IncarnateGamingLLC.utoKill = class AutoKill{
    static autoKill(token,data,hp){
        const actorUpdate = hp !== undefined ? true : false;
        var id = actorUpdate ? token.data.id : data.id;
        var combToken = undefined;
        hp = hp !== undefined ? hp : data.actorData["data.attributes.hp.value"];
        if (game.combat !== undefined){
            combToken = game.combat.data.combatants.find(comb => comb.tokenId === id);
        }
        if ((token.data.overlayEffect === "icons/svg/skull.svg" || actorUpdate) && hp >= 1){
            data.overlayEffect = "";
            if (combToken !== undefined){
                game.combat.updateCombatant({id:combToken.id,defeated:false});
            }
            if (actorUpdate === true){
                token.update(game.scenes.active.data._id,{overlayEffect:""});
            }
        }else if (hp === 0){
            data.overlayEffect = "icons/svg/skull.svg";
            if (combToken !== undefined){
                game.combat.updateCombatant({id:combToken.id,defeated:true});
            }
            if (actorUpdate === true){
                token.update(game.scenes.active.data._id,{overlayEffect:"icons/svg/skull.svg"});
            }
        }
    }
}
