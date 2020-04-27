Hooks.on("preCreateChatMessage", (chatFunction,chatMessage) =>{
    if (chatMessage.content === undefined)return;
    if (chatMessage.content.match(/^\/help/) !== null){
        chatMessage.content += '<div><strong>Public Commands:</strong> /statRoll /statAuditMe /statAudit /parseActor /pA /parseJournal /pJ /parseItem /pI</div><div><strong>GM Commands:</strong> /gmscreen</div><div>See <span class="crossReference" data-fid="g7NQ9CEj2AiLpxXs" data-type="JournalEntry" data-parent="HlyV9728fyQUUdDx" data-pack="world.incarnateRules">Player Quick Sheet</span> for more details</div>';
        return true;
    }
    //Messages about stats
    else if (chatMessage.content.match(/^\/stat/i) !== null){
        if (chatMessage.content.match(/^\/statRoll/i) !== null){
            const statRoll = StatRoll.playerStatRoll(chatMessage.user);
            if (statRoll !== false){
                chatMessage.content = "<p>" + JSON.stringify(statRoll) + "</p>";
            }
        }else if (chatMessage.content.match(/^\/statAuditMe/i) !== null){
            const tempMessage = StatRoll.statAudit(game.users.get(chatMessage.user).data.name);
            if (tempMessage !== false){
                chatMessage.content = tempMessage;
            }
        }else if (chatMessage.content.match(/^\/statAudit/i) !== null){
            var tempMessage = false;
            if(game.user.isGM && chatMessage.content.match(/^\/statAuditHard/i) !== null){
                tempMessage = StatRoll.statAuditHard(chatMessage.content.substr(15));
            }else{
                tempMessage = StatRoll.statAudit(chatMessage.content.substr(11));
            }
            if (tempMessage !== false){
                chatMessage.content = tempMessage;
            }
        }
    }
        //TODO move all these 5eModule references to the 5e module
    //Creating Cross Reference links in chat and console
    else if (chatMessage.content.match(/^\/parse/) !== null){
        if (chatMessage.content.match(/^\/parseActor/i) !== null){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseActor(chatMessage.content.substr(12));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        } else if (chatMessage.content.match(/^\/parseJournal/i) !== null){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseJournal(chatMessage.content.substr(14));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        } else if (chatMessage.content.match(/^\/parseItem/i) !== null){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseItem(chatMessage.content.substr(11));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        }
    }else if (chatMessage.content.match(/^\/p/) !== null){
        if (chatMessage.content.match(/^\/pA/)){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseActor(chatMessage.content.substr(4));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        }else if (chatMessage.content.match(/^\/pI/)){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseItem(chatMessage.content.substr(4));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        }else if (chatMessage.content.match(/^\/pJ/)){
            const tempMessage = IncarnateFiveEMessages.crossReferenceParseJournal(chatMessage.content.substr(4));
            if (tempMessage === false){
                return false;
            }
            chatMessage.content = tempMessage;
            console.log(chatMessage.content);
        }
    }
    if (!game.user.isGM)return;
    if (chatMessage.content.match(/^\/gmscreen/i) !== null || chatMessage.content.match(/^\/gms/i) !== null){
        incarnateGMblind();
        return false;
    }
});
