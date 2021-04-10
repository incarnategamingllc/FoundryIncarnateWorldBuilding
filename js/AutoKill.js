/**
 * Creates logic to assist in automatically marking defeated
 * actors as being dead.
 * @type {IncarnateGamingLLC.AutoKill}
 */
IncarnateGamingLLC.AutoKill = class AutoKill{
    static autoKill(actor,data,hp){
        console.log('running', actor, data, hp);
        let id = data._id;
        let combToken;
        if (game.combat !== undefined){
            combToken = game.combat.data.combatants.find(combatant => combatant.token.actorId === id);
        }
        console.log(combToken);
        if(!combToken)return true;
        const alreadyDead = actor.effects.find(effect => effect.getFlag("core", "statusId") === CONFIG.Combat.defeatedStatusId) ? true : false;
        hp = hp !== undefined ? hp : data.actorData.data.attributes.hp.value;
        console.log(hp, alreadyDead);
        if (hp >= 1 && alreadyDead){
            IncarnateGamingLLC.AutoKill.toggleDeath(combToken);
        }else if (hp <= 0 && !alreadyDead){
            IncarnateGamingLLC.AutoKill.toggleDeath(combToken);
        }
    }
    static async toggleDeath(combatant){
        let isDefeated = !combatant.defeated;
        await game.combat.updateCombatant({_id: combatant._id, defeated: isDefeated});
        const token = canvas.tokens.get(combatant.tokenId);
        if ( !token ) return;
        let status = CONFIG.statusEffects.find(e => e.id === CONFIG.Combat.defeatedStatusId);
        let effect = token.actor && status ? status : CONFIG.controlIcons.defeated;
        await token.toggleEffect(effect, {overlay: true, active: isDefeated});
    }
}
