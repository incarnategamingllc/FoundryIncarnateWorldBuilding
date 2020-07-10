// Hooks.on("preCreateChatMessage", (chatFunction,chatMessage) =>{
Hooks.on("preCreateChatMessage", (messageInformation, renderingSheet) =>{
    console.log("triggered preChreateChatMessage",messageInformation, renderingSheet);
    let chatMessage = messageInformation.content;
    if (chatMessage === undefined)return;
    if (chatMessage.match(/^\?help/) !== null){
        messageInformation.content = `<div><strong>Public Commands:</strong> ?statRoll ?statAuditMe ?statAudit </div><div><strong>GM Commands:</strong> ?gmscreen</div><div>See ${IncarnateGamingLLC.PLAYER_QUICK_SHEET} for more details</div>`;
        return true;
    }
    //Messages about stats
    else if (chatMessage.match(/^\?stat/i) !== null){
        if (chatMessage.match(/^\?statRoll/i) !== null){
            const statRoll = IncarnateGamingLLC.StatRoll.playerStatRoll(messageInformation.user);
            if (statRoll !== false){
                messageInformation.content = "<p>" + JSON.stringify(statRoll) + "</p>";
            }
        }else if (chatMessage.match(/^\?statAuditMe/i) !== null){
            const tempMessage = IncarnateGamingLLC.StatRoll.statAudit(game.users.get(messageInformation.user).data.name);
            if (tempMessage !== false){
                messageInformation.content = tempMessage;
            }
        }else if (chatMessage.match(/^\?statAudit/i) !== null){
            var tempMessage = false;
            if(game.user.isGM && chatMessage.match(/^\?statAuditHard/i) !== null){
                tempMessage = IncarnateGamingLLC.StatRoll.statAuditHard(chatMessage.substr(15));
            }else{
                tempMessage = IncarnateGamingLLC.StatRoll.statAudit(chatMessage.substr(11));
            }
            if (tempMessage !== false){
                messageInformation.content = tempMessage;
            }
        }
    }
    if (!game.user.isGM)return;
    if (chatMessage.match(/^\?gmscreen/i) !== null || chatMessage.match(/^\?gms/i) !== null){
        incarnateGMblind();
        return false;
    }
});
