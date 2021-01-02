Hooks.on("chatMessage", (chatFunction,chatMessage, chatData) =>{
    if(game.settings.get("incarnateWorldBuilding","chatMacros") === false) return true;
    if (chatMessage === undefined || chatMessage.match(/^\//) === null) return true;
    let found = false;
    if (chatMessage.match(/^\/((help)|(incarnate)|(incarnateHelp))/) !== null){
        found = true;
        chatData.content = `<div><strong>Public Commands:</strong> /help /statRoll /statAuditMe /statAudit </div><div><strong>GM Commands:</strong> /gmscreen</div><div>See ${IncarnateGamingLLC.PLAYER_QUICK_SHEET} for more details</div>`;
        Hooks.call('incarnateHelpMessage', chatData);
        chatMessage = chatData.content;
    }
    //Messages about stats
    else if (chatMessage.match(/^\/stat/i) !== null){
        found = true;
        if (chatMessage.match(/^\/statRoll/i) !== null){
            const statRoll = IncarnateGamingLLC.StatRoll.playerStatRoll(chatData.user);
            if (statRoll !== false){
                chatMessage = "<p>" + JSON.stringify(statRoll) + "</p>";
            }
        }else if (chatMessage.match(/^\/statAuditMe/i) !== null){
            const tempMessage = IncarnateGamingLLC.StatRoll.statAudit(game.users.get(chatData.user).data.name);
            if (tempMessage !== false){
                chatMessage = tempMessage;
            }
        }else if (chatMessage.match(/^\/statAudit/i) !== null){
            let tempMessage = false;
            if(game.user.isGM && chatMessage.match(/^\/statAuditHard/i) !== null){
                tempMessage = IncarnateGamingLLC.StatRoll.statAuditHard(chatMessage.substr(15));
            }else{
                tempMessage = IncarnateGamingLLC.StatRoll.statAudit(chatMessage.substr(11));
            }
            if (tempMessage !== false){
                chatMessage = tempMessage;
            }
        }
    }
    if (!game.user.isGM)return;
    if (chatMessage.match(/^\/gmscreen/i) !== null || chatMessage.match(/^\/gms/i) !== null){
        found = true;
        IncarnateGamingLLC.openGmScreen();
    }
    if(found){
        chatData.type = CONST.CHAT_MESSAGE_TYPES.OOC;
        chatData.content = chatMessage;
        CONFIG.ChatMessage.entityClass.create(chatData, {});
        return false;
    }else{
        return true;
    }
});
