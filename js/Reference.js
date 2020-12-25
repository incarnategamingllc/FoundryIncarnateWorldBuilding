/**
 * Cross Reference
 */
IncarnateGamingLLC.Reference = class Reference{
    static async lookupActorComplete(_id,pack,packContent){
        var result = await this.lookupLocalActorByOrigin(_id);
        if (result[0]!==false) {return result};
        result = await this.lookupPackEntityByOrigin(_id,pack,packContent);
        if (result[0]!==false) {return result};
        result = await this.lookupLocalActorById(_id);
        if (result[0]!==false) {return result};
        result = await this.lookupPackEntityById(_id,pack);
        if (result[0]!==false) {return result};
        return [false];
    }
    static lookupLocalActorByOrigin(originID){
        const actors = game.actors.entities;
        const actorLen = actors.length;
        for (var z=0; z<actorLen; z++){
            if (actors[z].data.flags.origin!==undefined){
                if(actors[z].data.flags.origin._id===originID){
                    return [actors[z]];
                }
            }
        }
        return [false];
    }
    static lookupLocalActorById(_id){
        const actor = game.actors.get(_id);
        if (actor !== undefined){
            return [actor];
        }
        return [false];
    }
    static async lookupItemComplete(_id,pack,packContent){
        var result = await this.lookupLocalItemByOrigin(_id);
        if (result[0]!==false) {return result};
        result = await this.lookupPackEntityByOrigin(_id,pack,packContent);
        if (result[0]!==false) {return result};
        result = await this.lookupLocalItemById(_id);
        if (result[0]!==false) {return result};
        result = await this.lookupPackEntityById(_id,pack);
        if (result[0]!==false) {return result};
        return [false];
    }
    static lookupLocalItemByOrigin(originID){
        const items = game.items.entities;
        const itemLen = items.length;
        for (var z=0; z<itemLen; z++){
            if (items[z].data.flags.origin!==undefined){
                if(items[z].data.flags.origin._id===originID){
                    return [items[z]];
                }
            }
        }
        return [false];
    }
    static lookupLocalItemById(_id){
        const item = game.items.get(_id);
        if (item !== undefined){
            return [item];
        }
        return [false];
    }
    static async lookupJournalComplete(_id,pack,packContent){
        var result = await this.lookupLocalJournalByOrigin(_id);
        if (result[0]!==false) {return result};
        result = await this.lookupPackEntityByOrigin(_id,pack,packContent);
        if (result[0]!==false) {return result};
        result = await this.lookupLocalJournalById(_id);
        if (result[0]!==false) {return result};
        result = await this.lookupPackEntityById(_id,pack);
        if (result[0]!==false) {return result};
        return [false];
    }
    static lookupLocalJournalByOrigin(originID){
        const journals = game.journal.entities;
        const journalLen = journals.length;
        for (var z=0; z<journalLen; z++){
            if (journals[z].data.flags.origin!==undefined){
                if(journals[z].data.flags.origin._id===originID){
                    return [journals[z]];
                }
            }
        }
        return [false];
    }
    static lookupLocalJournalById(_id){
        const journalEntry = game.journal.get(_id);
        if (journalEntry !== undefined){
            return [journalEntry];
        }
        return [false];
    }
    static async lookupPackEntityByOrigin(originID,pack,packContent){
        if (pack == null)return false;
        //console.log("originID",originID,"pack",pack,"packContent",packContent);
        if (packContent === undefined){
            if (pack==""){return [false]};
            const packFound = this.incarnatePackFind(pack);
            if (packFound===undefined){console.warn("Pack: ",pack," not found");return [false]};
            packContent = await packFound.getContent();
        }
        const packContentLen = packContent.length;
        for (var z=0; z<packContentLen; z++){
            if (packContent[z].data.flags.origin!==undefined){
                if (packContent[z].data.flags.origin._id===originID){
                    const sheet = [packContent[z],pack];
                    return sheet;
                }
            }
        }
        return [false];
    }
    static async lookupPackEntityById(_id,pack){
        const packFound = this.incarnatePackFind(pack);
        if (packFound===[false]){return [false]};
        const tempItem = await packFound.getEntity(_id);
        const sheet = [tempItem,pack]
        return sheet;
    }
    static rollMacroSetup(html){
        html.innerHTML = html.innerHTML.replace(/@Roll\[(([ \+-]*([0-9]+)?[dD]([0-9fF]+)([a-z][a-z0-9<=>]+)?)+([ \+-]*[0-9]+)*)+\]/g, function (x) {
            x = x.replace(/@Roll\[/g,'<a class="incRollMacro"><i class="fas fa-dice"></i> ');
            x = x.replace(/\]/g,'</a>');
            return x;
        });
        return html;
    }
    static rollMacroSetClick(html){
        const rollNodes = html.getElementsByClassName("incRollMacro");
        [].forEach.call(rollNodes,node =>{
            node.addEventListener("click",Reference.rollMacroClick);
        });
        return html;
    }
    static rollMacroClick(ev){
        var element = Reference.getClosestClass(ev.srcElement,"incRollMacro");
        var temporaryRoll = new Roll(element.textContent);
        temporaryRoll.toMessage();
    }
    static secretSetContext(html,context){
        const secretNodes = html.getElementsByClassName("secret");
        const entryOptions = [
            {
                name:" Reveal/Hide",
                icon: '<i class="fas fa-comment-dots"/>',
                callback:secret => Reference.secretReveal(secret,context),
                condition: game.user.isGM
            }
        ];
        Hooks.call(`getSecretContext`, $(html), entryOptions);
        //Currently the default ContextMenu function creates an error by applying a new listener each time the entity is saved and refreshed. You can either fix that with your JQuery or use me re-write below. Of note, the "getClosestClass" is a function that walks up the chain until it gets to an element with the assigned class, similar to the JQuery path you use.
        //new ContextMenu($(html),".secret",entryOptions);
        var dropDown = document.createElement("nav");
        dropDown.id="context-menu";
        var ol = document.createElement("ol");
        ol.classList.add("context-items");
        entryOptions.forEach(option =>{
            let display = true;
            if (option.condition !== undefined){
                display = (option.condition instanceof Function) ? option.condition() : option.condition;
            }
            if (display) {
                var li = document.createElement("li");
                li.innerHTML = option.icon + option.name;
                li.classList.add("context-item");
                li.addEventListener("click", inc => {
                    var secret = Reference.getClosestClass(inc.srcElement,"secret");
                    option.callback(secret,context);
                    var navNode = secret.getElementsByTagName("nav");
                    if (navNode.length > 0){
                        navNode[0].remove();
                    }
                });
                ol.append(li);
            }
        });
        dropDown.append(ol);
        [].forEach.call(secretNodes, node=> {
            node.addEventListener("contextmenu", context =>{
                var secret = Reference.getClosestClass(context.srcElement,"secret");
                var navNode = secret.getElementsByTagName("nav");
                if (navNode.length === 0){
                    secret.append(dropDown);
                    secret.style="position:relative";
                }else{
                    navNode[0].remove();
                }
            });
        });
    }
    static async secretReveal(secret,context){
        //secret = secret[0];
        const navElement = secret.getElementsByTagName("nav");
        [].forEach.call(navElement, nav =>{
            nav.parentElement.removeChild(nav);
        });
        if (secret.classList.value.match(/learned/) !== null){
            secret.classList.remove("learned");
        }else{
            secret.classList.add("learned");
            ChatMessage.create({
                user:game.userId,
                content:secret.innerHTML,
                type:1
            },{});
        }
        const editorContent = Reference.getClosestClass(secret,"editor-content");
        console.log(editorContent,context);
        context.object.update({[editorContent.getAttribute("data-edit")]:editorContent.innerHTML});
        await Reference.incarnateDelay(500);
        context.object.render(false);
    }
    static enrichHTML (content, {secrets=false, entities=true, links=true}={}) {
        let html = document.createElement("div");
        html.innerHTML = content;

        // Strip secrets
        if ( !secrets ) {
            let elements = html.querySelectorAll("section.secret");
            elements.forEach(e =>{
                console.log(e);
                if (e.classList.value.match(/learned/) === null){
                    e.parentNode.removeChild(e);
                }
            });
        }

        // Match entities
        if ( entities ) {
            let rgx = /@(Actor|Item|JournalEntry|Scene)\[([^\]]+)\]/g;
            html.innerHTML = html.innerHTML.replace(rgx, _replaceEntity);
            html = Reference.rollMacroSetup(html);
        }

        // Replace hyperlinks
        if ( links ) {
            let rgx = /(?:[^\S]|^)((?:(?:https?:\/\/)|(?:www\.))(?:\S+))/gi;
            html.innerHTML = html.innerHTML.replace(rgx, _replaceHyperlinks);
        }

        return html.innerHTML;
    };
    static crossReferenceSetClick(node){
        const crossReferences = node.getElementsByClassName("crossReference");
        const crossRefLen = crossReferences.length;
        for (var a = 0; a<crossRefLen; a++){
            crossReferences[a].addEventListener("click",Reference.crossReferenceClick);
            if (crossReferences[a].draggable === true){
                crossReferences[a].addEventListener("dragstart",Reference.crossReferenceDragStart);
            }
        }
    }
    static crossReferenceClick(ev) {
        //console.log("I've been clicked!!",ev);
        var optionalPack = ev.currentTarget.getAttribute("data-pack");
        if (optionalPack === ""){optionalPack = null};
        var optionalParent = ev.currentTarget.getAttribute("data-parent");
        if (optionalParent === ""){optionalParent = null};
        //console.log(ev.currentTarget);//,optionalPack,optionalParent
        Reference.crossReference(ev.currentTarget.getAttribute("data-fid"),ev.currentTarget.getAttribute("data-type"),optionalPack,optionalParent);
    }
    static crossReferenceDragStart(ev){
        if (ev.srcElement.getAttribute("data-pack")!== undefined && ev.srcElement.getAttribute("data-pack")!== null){
            if(ev.srcElement.getAttribute("data-pack").match(/ItemPacks/i) !== null){
                var dragField = {
                    type:"itemPack",
                    pack:ev.srcElement.getAttribute("data-pack"),
                    id:ev.srcElement.getAttribute("data-fid")
                }
            }else{
                var dragField = {
                    type:ev.srcElement.getAttribute("data-type"),
                    pack:ev.srcElement.getAttribute("data-pack"),
                    id:ev.srcElement.getAttribute("data-fid")
                }
            }
        }else{
            var dragField = {
                type:ev.srcElement.getAttribute("data-type"),
                id:ev.srcElement.getAttribute("data-fid")
            }
        }
        event.dataTransfer.setData("text/plain",JSON.stringify(dragField));
    }
    static incarnateJSONcheck(input){
        if (input.match(/^{\"type\":\"Item\",\"id\":\"[a-zA-Z0-9]{16}\"}$/)!==null){
            return true;
        }else if (input.match(/^\[?\{\"type\":\"Item\",\"pack\":\"\w+\.\w+",\"id\":\"[a-zA-Z0-9]{16}\"\}(,\{\"type\":\"Item\",\"pack\":\"\w+\.\w+",\"id\":\"[a-zA-Z0-9]{16}\"\})*]?$/)!== null){
            return true;
        }else if (input.match(/^\{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"id\":[0-9]+}$/)!==null){
            return true;
        }else if (input.match(/^\{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\"\"pack\":\"\",\"id\":[0-9]+}$/)!==null){
            return true;
        }else if (input.match(/^\[{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"pack\":\"\",\"id\":[0-9]+}(,{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"pack\":\"\",\"id\":[0-9]+})*\]$/)!==null){
            return true;
        }else if (input.match(/^\[{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"pack\":\"\w+\.\w+\",\"id\":[0-9]+}(,{\"type\":\"Item\",\"actorId\":\"[a-zA-Z0-9]{16}\",\"pack\":\"\w+\.\w+\",\"id\":[0-9]+})*\]$/)!==null){
            return true;
        }else if (input.match(/^{\"type\":\"itemPack\",\"pack\":\"\w+\.\w+\",\"id\":\"[a-zA-Z0-9]{16}\"}$/)!==null){
            return true;
        }else if (input.match(/^{\"type\":\"itemPack\",\"pack\":\"\",\"id\":\"[a-zA-Z0-9]{16}\"}$/)!==null){
            return true;
        }
        console.log("Not an item: ",input);
        return false;
    }
    static incarnateDelay(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static incarnateDelayNonAsync(ms){
        //Try to NEVER use this. It is a busy wait and therefore very very painful.
        const date = Date.now();
        const targetDate = date + ms;
        var curDate = null;
        do{
            curDate = Date.now();
        }while (curDate < targetDate);
        return "finished";
    }
    static async onDragStart(ev){
        if (ev.target.getAttribute("data-type")==="Item"){
            const dragItem = {
                type: ev.target.getAttribute("data-type"),
                pack: ev.target.getAttribute("data-pack"),
                id: ev.target.getAttribute("data-fid")
            };
            ev.dataTransfer.setData("text/plain", JSON.stringify(dragItem));
            return dragItem;
        }else if(ev.target.getAttribute("data-type")==="Actor"){
            const packName = ev.srcElement.getAttribute("data-pack");
            if(packName.search("ItemPacks")!==-1){
                const dragItem = {
                    type: "itemPack",
                    pack: ev.srcElement.getAttribute("data-pack"),
                    id: ev.srcElement.getAttribute("data-fid")
                }
                ev.dataTransfer.setData("text/plain", JSON.stringify(dragItem));
            }
        }else{
            console.log("Error 9772: Non Items not yet draggable");
        }
    }
    static async crossReference(fid,type,pack,fidParent){
        if(fidParent!=null){
            var fidChild = fid;
            fid = fidParent;
        }
        var entry = undefined;
        var packFound;
        if (type === "Item"){
            entry = await Reference.lookupLocalItemByOrigin(fid);
            if (entry[0] === false){
                entry = await Reference.lookupLocalItemById(fid);
            }
            entry = entry[0];
        } else if (type === "Table"){
            console.log("Tables not yet supported");
            return 0;
        } else if (type === "JournalEntry"){
            entry = await Reference.lookupLocalJournalByOrigin(fid);
            if (entry[0] === false){
                entry = await Reference.lookupLocalJournalById(fid);
            }
            entry = entry[0];
        } else if (type === "Encounter"){
            console.log("Encounters not yet supported");
            return 0;
        } else if (type === "internalReference"){
            Reference.crossReferenceInternalReference(fid);
            return 0;
        } else if (type === "Actor"){
            entry = await Reference.lookupLocalActorByOrigin(fid);
            if (entry[0] === false){
                entry = await Reference.lookupLocalActorById(fid);
            }
            entry = entry[0];
        }
        if (entry === false){//check compendium for id
            entry = await Reference.lookupPackEntityByOrigin(fid,pack);
            if (entry[0] === false){
                entry = await Reference.lookupPackEntityById(fid);
            }
            entry = entry[0];
        }
        if (entry === null || entry === false || entry === undefined){
            console.warn("No match found for id: ",fid);
            return false;
        }
        if (!entry.visible){
            //if (!entry.data.permission.default > 0 || entry.data.permission[game.userId] > 0){
            console.log("Access denied to: ",entry.data.name);
            return;
            //}
        }
        entry.sheet.render(true);
        await Reference.incarnateDelay(300);
        if (fidChild!=null){
            document.getElementById(fidChild).scrollIntoView(false,{block:"center",inline:"center"});
        }
        return 0;
    }
    static crossReferenceInternalEquipment(values){
        if (ui._incarnateEquipmentBrowser === undefined){
            ui._incarnateEquipmentBrowser = new IncarnateEquipmentBrowser(Reference.incarnatePackFind("world.incarnateEquipment").metadata);
        }
        ui._incarnateEquipmentBrowser.values = values;
        ui._incarnateEquipmentBrowser.render(true);
    }
    static crossReferenceInternalSpells(values){
        if (ui._incarnateSpellBrowser === undefined){
            ui._incarnateSpellBrowser = new IncarnateSpellBrowser(Reference.incarnatePackFind("world.incarnateSpells").metadata);
        }
        ui._incarnateSpellBrowser.values = values;
        ui._incarnateSpellBrowser.render(true);
    }
    static crossReferenceInternalReference(fid){
        if (fid === "KtzfRQAq8T3SPyDW"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroType:["Weapon"]});
        }else if (fid === "KvEKbUCQMZ5rUcBW"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Simple Melee Weapon"]});
        }else if (fid === "KvJQYEd9DkAbbEWb"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Simple Ranged Weapon"]});
        }else if (fid === "KwP04BSZd05sROpc"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Martial Melee Weapon"]});
        }else if (fid === "KwQRqynnMUUNEz1o"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Martial Ranged Weapon"]});
        }else if (fid === "Kx3SHGFAPsAubEnQ"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Improvised Weapon"]});
        }else if (fid === "KyjwZg4XrojEv1An"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroType:["Armor"]});
        }else if (fid === "Kyt1LKZ4goYufXjx"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Light Armor"]});
        }else if (fid === "KzNG5R0GbxqxgsJd"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Medium Armor"]});
        }else if (fid === "KzS6trWu7IhhDvRO"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Heavy Armor"]});
        }else if (fid === "L0cSX2XngITYvVk7"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Shield"]});
        }else if (fid === "LZDgMApt1P9oVCxi"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroType:["Adventuring Gear"]});
        }else if (fid === "LDCJMhc8KNfcdeWG"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Ammunition"]});
        }else if (fid === "LEUQ02SM10vGG1sF"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Alcohol"]});
        }else if (fid === "LG4UNtR1tkdIBbPj"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Arcane Focus"]});
        }else if (fid === "LHHZSYzjuChDkqTM"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Artisan's Tool"]});
        }else if (fid === "LHLkM5LDN7y20mql"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Book"]});
        }else if (fid === "LHpQDDOUVIB6EPug"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Container"]});
        }else if (fid === "LI75zCRLm7RJsbf5"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Cosmetic"]});
        }else if (fid === "LIDOgFwUaQ7UFVRj"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Druidic Focus"]});
        }else if (fid === "LP0IhtTNvdo6xono"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Equipment Kits"]});
        }else if (fid === "LPIDIsTLX4MrAISB"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Spoof"]});
        }else if (fid === "LPXwoZlzmXcvY70R"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Gaming Set"]});
        }else if (fid === "LPv56DsP7aEScLS8"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Holy Symbol"]});
        }else if (fid === "LREJCwm149LANLE2"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Land Vehicle"]});
        }else if (fid === "LS6IWOQcNqRcAl0a"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Musical Instrument"]});
        }else if (fid === "LV9cTD6dviatjI10"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Pet"]});
        }else if (fid === "LVr5gQxGYFhtVvTj"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Poisons"]});
        }else if (fid === "LWJHdyfBULNZuUXD"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Standard"]});
        }else if (fid === "LWNts0ZYUVZle4iC"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Poisons"]});
        }else if (fid === "LYaKMxiQGnOLZyFK"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Tool"]});
        }else if (fid === "LeNU6Gwk2NJBzMnG"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Waterborne Vehicle"]});
        }else if (fid === "LZYNX77ATgifJ9aa"){
            Reference.crossReferenceInternalEquipment({equipmentBroMagic:["false"], equipmentBroMundane:["true"], equipmentBroSubtype:["Mount"]});
        }else if (fid === "KpUWHS10UWD9nCS9"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Bard"]});
        }else if (fid === "KpgvCoEvVJENJbQe"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Cleric"]});
        }else if (fid === "KqYHBiDOspVLEjnS"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Druid"]});
        }else if (fid === "Kr18QgVsdpWGge40"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Paladin"]});
        }else if (fid === "KrxUJrL26mbaPybS"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Ranger"]});
        }else if (fid === "Kstoh47suTlBZkVg"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Rune Blade"]});
        }else if (fid === "Kt3gNPehMFi1BqaU"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Runecrafter"]});
        }else if (fid === "KtZ3ojH6GlhLgLXJ"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Sorcerer"]});
        }else if (fid === "KtiIMCXHY9yIFwk8"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Warlock"]});
        }else if (fid === "KtyqSZNvGfls3cFU"){
            Reference.crossReferenceInternalSpells({spellBroCaster:["Wizard"]});
        }else{
            console.warn("Internal Reference: ",fid," is currently not supported. Please report this message to ProNobis#7047 on either Foundries discord: https://discordapp.com/invite/DDBZUDf or on the Incarnate Gaming discord server: https://discord.gg/pqkeFYc");
        }
    }
    static incarnatePackFind(packName){
        if (packName == undefined){return false};
        var packs = game.packs;
        if (packName.includes(".")){
            var packFound = packs.find(pack => pack.collection === packName);
            if (packFound === undefined){
                packFound = packs.find(pack => pack.metadata.name === packName.split(".")[1]);
                console.warn("Pack reference to '",packName,"' does not contain a valid reference to holding module: error type 1");
            }
            return packFound;
        }else{
            const packFound = packs.find(pack => pack.metadata.name === packName);
            console.warn("Pack reference to '",packName,"' does not contain reference to holding module: error type 2");
            return packFound;
        }
    }
    static incarnateRoll(dice) {
        var numDice = 0, sizeDice= 0, modType="", modifier= 0, calculation= 0;
        var fullPattern= /^[0-9]+d[0-9]+[\+\-]{1}[0-9]+$/;
        var fullPatternFind = dice.split(/[\-\+d]/);
        if (dice.search(fullPattern)==0) {
            numDice = fullPatternFind[0];
            sizeDice = fullPatternFind[1];
            modifier = fullPatternFind[2];
            if (dice.search(/\-/)!=-1){
                modType="-";
            } else{
                modType="+";
            }
        } else if (dice.search(/^[0-9]+d[0-9]+$/)==0){
            numDice = fullPatternFind[0];
            sizeDice = fullPatternFind[1];
        } else if (dice.search(/^[0-9]+[\+\-]{1}[0-9]+$/)==0){
            calculation = fullPatternFind[0]*1;
            modifier = fullPatternFind[1];
            if (dice.search(/\-/)!=-1){
                modType="-";
            } else{
                modType="+";
            }
        } else if (dice.search(/^[0-9]+$/)==0){
            calculation = fullPatternFind[0]*1;
        }
        for (var d=0;d<numDice;d++){
            calculation = calculation + Math.floor(Math.random()*sizeDice) + 1;
            IncarnateGamingLLC.rollCount++;
        }
        if (modType =="-"){
            modifier = modifier*-1;
        } else {
            modifier = modifier * 1;
        }
        calculation = calculation + modifier;
        return calculation;
    }
    //adds isPending, isRejected and isResolved properties to a promise
    static getPromiseStatus(promise){
        if (promise.isResolved) return promise;

        var isPending = true;
        var isRejected = false;
        var isResolved = false;

        var result = promise.then(
            function(v) {
                isResolved = true;
                isPending = false;
                return v;
            },
            function(e) {
                isRejected = true;
                isPending = false;
                throw e;
            }
        );
        result.isResolved = function() {return isResolved;};
        result.isPending = function() {return isPending;};
        result.isRejected = function() {return isRejected;};
        return result;
    }
    static async loadIncarnateTables() {
        return fetch("modules/incarnateWorldBuilding/packs/incarnateTables.json").then(resp => resp.json());
    }
    static async loadIncarnateTemplates() {
        return fetch("modules/incarnateWorldBuilding/packs/incarnateTemplates.json").then(resp => resp.json());
    }
    static recursiveTableTo(tableRows){
        var currentRow = tableRows.length - 1;
        for (currentRow; currentRow > -1; currentRow--){
            if (tableRows[currentRow].to !== 0){
                return tableRows[currentRow].to;
            }else if (currentRow === 0){
                return 0;
            }
        }
    }
    /**
     * tableID = id of table
     * incarnateTables = the tables array if already called to speed processing
     * nestedCall = true if inside a nested call that needs to force an abort in other situations
     */
    static async rollTable(tableID,incarnateTables){
        //if linguistic name force a nested Call and sanitization
        if (tableID === "nWo43aczXL5Qu1zd") return Reference.rollTableNested("nWo43aczXL5Qu1zd", incarnateTables);
        if (tableID === "nd7yy4dP0IZQHHvD") return Reference.rollTableNested("nd7yy4dP0IZQHHvD", incarnateTables);
        var random = Math.random(); //random number from 0-1
        var tablePosition;
        IncarnateGamingLLC.rollCount++;
        if (incarnateTables===null || incarnateTables===undefined){
            incarnateTables = await this.loadIncarnateTables();
        }
        for (var j in incarnateTables){
            if (incarnateTables[j]._id ==tableID){
                tablePosition = j;
            }
        }
        if (tablePosition === undefined){
            console.log("Missing Table "+tableID);
            return false;
        }
        var lastRow = incarnateTables[tablePosition].data.row.length - 1;
        var highrow = incarnateTables[tablePosition].data.row[lastRow].to; //finds to field of last row
        if (highrow === 0){
            highrow = this.recursiveTableTo(incarnateTables[tablePosition].data.row);
        }
        var tableRow =  Math.floor(random*highrow); // use random number to find row in table
        for (var i=0;i<lastRow+1;i++){
            if (incarnateTables[tablePosition].data.row[i].to>=tableRow){
                var result = document.createElement("div")
                result.innerHTML = incarnateTables[tablePosition].data.row[i].column[0].content;
                return result ;
            }
        }
        console.log("Missing Table 2 " + tableID);//missing table to console
        return "";
    }
    static async rollTableNested(tableID,incarnateTables){
        var fullResult = document.createElement("div");
        if (incarnateTables===null || incarnateTables===undefined){
            incarnateTables = await this.loadIncarnateTables();
        }
        do{
            var anotherTable = false;
            var random = Math.random(); //random number from 0-1
            var tablePosition;
            IncarnateGamingLLC.rollCount++;
            for (var j in incarnateTables){
                if (incarnateTables[j]._id ==tableID){
                    tablePosition = j;
                }
            }
            if (tablePosition === undefined){
                console.log("Missing Table "+tableID);
                return false;
            }
            var lastRow = incarnateTables[tablePosition].data.row.length - 1;
            var highrow = incarnateTables[tablePosition].data.row[lastRow].to; //finds to field of last row
            if (highrow === 0){
                highrow = this.recursiveTableTo(incarnateTables[tablePosition].data.row);
            }
            var tableRow =  Math.floor(random*highrow); // use random number to find row in table
            for (var i=0;i<lastRow+1;i++){
                if (incarnateTables[tablePosition].data.row[i].to>=tableRow){
                    var result = incarnateTables[tablePosition].data.row[i].column[0].content;
                    if (fullResult.innerHTML === ""){
                        fullResult.innerHTML = result;
                    }else{
                        var genNodes = fullResult.getElementsByClassName("generate");
                        var genNodeLen = genNodes.length;
                        for (var k=0; k<genNodeLen; k++){
                            if (genNodes[k].getAttribute("data-fid") === tableID){
                                if (genNodes[k].getAttribute("data-date") === null){
                                    genNodes[k].setAttribute("data-date", IncarnateGamingLLC.Calendar.incarnateDate());
                                    genNodes[k].innerHTML = result;
                                }
                            }
                        }
                    }
                }
            }
            var genNodes = fullResult.getElementsByClassName("generate");
            for (var l=0; l<genNodes.length; l++){
                if (genNodes[l].getAttribute("data-date") === null){
                    anotherTable = true;
                    tableID = genNodes[l].getAttribute("data-fid");
                    break;
                }
            }
        }while (anotherTable === true);
        fullResult.innerHTML = Reference.sanitizeName(fullResult.innerHTML);
        fullResult.innerHTML = fullResult.innerHTML.replace(/\s/g,"");
        console.log(fullResult.innerHTML);
        return fullResult;
    }

    /**
     * Table generation
     * @param input
     * @returns {Promise<string>}
     */
    static async generation(input){
        const incarnateTables = await this.loadIncarnateTables();
        var found;
        var data = document.createElement("div");
        data.setAttribute("id","tempNode");
        data.innerHTML = input;
        var generateNodes = data.getElementsByClassName("generate");//var pattern = /[a-zA-Z]{6}/gmi;
        //console.log("input",input,"generateNodes",generateNodes);
        var genNodeLen = generateNodes.length;
        do{
            found = false;
            genNodeLen = generateNodes.length;
            for (var b=0;b<genNodeLen;b++){
                if (generateNodes[b].hasAttribute("data-date")){
                }
                else{
                    var nodeQuantity;
                    if (generateNodes[b].getAttribute("data-quantity")!=null){
                        nodeQuantity = generateNodes[b].getAttribute("data-quantity");
                        nodeQuantity = this.incarnateRoll(nodeQuantity);
                    }else{
                        nodeQuantity = 1;
                    }
                    found = true;
                    var fid=generateNodes[b].getAttribute("data-fid");
                    var result ="";
                    //console.log("fid",fid,"quantity",nodeQuantity);
                    for (var e=0;e<nodeQuantity;e++){
                        var preresult = await this.rollTable(fid,incarnateTables);
                        if (preresult.getElementsByTagName("p").length==1){
                            preresult=preresult.innerHTML;
                            preresult=preresult.replace(/<p> ?/,"");
                            preresult=preresult.replace(/ ?<\/p>/,"");
                        }else{
                            preresult=preresult.innerHTML;
                        }
                        result = result + preresult;
                    }
                    generateNodes[b].innerHTML = result;
                    generateNodes[b].setAttribute("data-date", IncarnateGamingLLC.Calendar.incarnateDate());
                }
            }
        }while (found === true);
        genNodeLen = generateNodes.length;
        do {
            found = false;
            var calcNodes = data.getElementsByTagName("calculate");
            var calcNodeLen = calcNodes.length;
            for (var f=0;f<calcNodeLen;f++){
                if (calcNodes[f].hasAttribute("data-date")){
                }
                else {
                    calcNodes[f].innerHTML=this.incarnateRoll(calcNodes[f].innerHTML);
                    calcNodes[f].setAttribute("data-date", IncarnateGamingLLC.Calendar.incarnateDate());
                }
            }
        }
        while (found ===true);
        do {
            found = false;
            var genLinkNodes = data.getElementsByClassName("genLink");
            var genLinkNodesLen = genLinkNodes.length;
            for (var c=0;c<genLinkNodesLen;c++){
                if (genLinkNodes[c].hasAttribute("data-date")){
                }
                else {
                    found = true;
                    var linkFid = genLinkNodes[c].getAttribute("data-fid");
                    result = "";
                    for (var b=0;b<genNodeLen;b++){
                        if (linkFid == generateNodes[b].getAttribute("data-fid")){
                            result = result + generateNodes[b].innerHTML + " ";
                        }
                    }
                    genLinkNodes[c].innerHTML = result;
                    genLinkNodes[c].setAttribute("data-date", IncarnateGamingLLC.Calendar.incarnateDate());
                }
            }
        }
        while (found===true);
        data=data.innerHTML;
        return data;
    }

    /**
     * Removes html tags from a name
     * @param name
     * @returns {string}
     */
    static sanitizeName(name){
        name = name.replace(/\u21b5|[\r\n]/g,"");
        name = name.replace(/> <\//g,"></");
        name = name.replace(/<.*?>/g,"");
        name = name.replace(/^\s/g,"");
        name = name.replace(/\s$/g,"");
        return name;
    }
    static templateInsert(ev){
        const loreGenerator = Reference.getClosestClass(ev.srcElement,"loreGenerator");
        const templatePosition = loreGenerator.getElementsByClassName("templatePosition")[0];
        Reference.populateTemplateInsert(templatePosition.value.split("__")[0]);
    }
    static getClosestClass (elem,targetClass){
        while (elem.classList.contains(targetClass) === false && elem.classList.contains("vtt") === false){
            elem = elem.parentElement;
        }
        if (elem.classList.contains(targetClass)) return elem;
        return false;
    }
    static sortAlphabeticallyName(data){
        data.sort(function(a,b){
            const x = a.name.toLowerCase();
            const y = b.name.toLowerCase();
            if (x < y) {return -1};
            if (y < x) {return 1};
            return 0;
        });
        return data;
    }
    /*
     * logic to split between generating journal entries and special cases
     */
    static async populateTemplateInsert(fid,parentElement){
        const incarnateTemplates = await this.loadIncarnateTemplates();
        const template = incarnateTemplates.find(templates=>templates._id === fid);
        if (template === undefined){
            console.warn("Template: ", fid, " not found");
            return false;
        }
        var result, resultType;
        if (template.flags.templateType === "NPCs" && typeof npcGeneration !== "undefined"){
            result = await npcGeneration(template,parentElement);
            resultType = "Actor";
        }else{
            result = await this.populateCreateJournalTemplate(template,parentElement);
            resultType = "JournalEntry";
        }
        return {"result":result,"resultType":resultType};
    }
    /*
     * generation of journal entries that returns the journal entry
     */
    static async populateCreateJournalTemplate(template,parentElement){
        if (parentElement === undefined) parentElement = "";
        var tempContents = "<incTempHead class=\"TemplateTitle\">" + template.name + "</incTempHead>\n" + parentElement + template.data.description
        var tempContents =  await this.generation(tempContents);
        var tempName = tempContents.match(/<incTempHead class="TemplateTitle">(.|[\r\n])*?<\/incTempHead>/gi);
        const incRegions = game.settings.get("incarnateWorldBuilding","incRegions");
        tempName = Reference.sanitizeName(tempName[0]);
        const data = {
            name:tempName,
            permission:{"default":0},
            folder:incRegions.currentRegion,
            flags:{
                recurrence:template.data.recurrence,
                sourceID:template._id,
                sourceName:"",
                date: IncarnateGamingLLC.Calendar.incarnateDate()
            },
            content:tempContents
        }
        const newJournal = await JournalEntry.create(data);
        return newJournal;
    }
    static generate(){
        console.log("generate");
    }
    static populateSetClick(node){
        const populates = node.getElementsByClassName("populate");
        const crossRefLen = populates.length;
        for (var a = 0; a<crossRefLen; a++){
            populates[a].addEventListener("click",Reference.populateClick);
        }
    }
    static populateClick(ev) {
        Reference.populate(ev);
    }
    static populate(ev){
        if (ev.currentTarget.getAttribute("data-date"))return false;
        const app = Reference.getClosestClass(ev.currentTarget,"app");
        var type, name;
        if (app.id.split("-")[0] === "journal"){
            type = "JournalEntry";
        }
        if (type === "JournalEntry"){
            name = app.getElementsByTagName("input")[0].value;
        }
        const fid = app.id.split("-")[1];
        const parentElement = '<strong>Parent Element:</strong><span class="crossReference" data-fid="'+ fid +'" data-type="'+ type +'">'+ name +'</span>\n';
        const childFid = ev.currentTarget.getAttribute("data-fid");
        const newEntry = this.populateTemplateInsert(childFid,parentElement);
        newEntry.then(entry => {
            const entryType = entry.resultType;
            entry = entry.result;
            const origin = game.journal.get(fid);
            var holder = document.createElement("div");
            holder.innerHTML = origin.data.content;
            var populateNodes = holder.getElementsByClassName("populate");
            var populateNodesThis = [];
            for (let node of populateNodes) {
                if (node.getAttribute("data-fid") === childFid){
                    populateNodesThis.push(node);
                }
            }
            var targetNode;
            for (var a=0; a<populateNodesThis.length; a++){
                if (!populateNodesThis[a].getAttribute("data-date")){
                    targetNode = populateNodesThis[a];
                    break;
                }
            }
            targetNode.setAttribute("data-date", IncarnateGamingLLC.Calendar.incarnateDate());
            var crossReferenceNode = document.createElement("span");
            crossReferenceNode.setAttribute("class","crossReference");
            crossReferenceNode.setAttribute("data-fid",entry.data._id);
            crossReferenceNode.setAttribute("data-type",entryType);
            crossReferenceNode.setAttribute("draggable","true");
            crossReferenceNode.innerHTML = entry.data.name;
            targetNode.innerHTML = crossReferenceNode.outerHTML;
            let journal = game.journal.get(fid);
            journal.update({content:holder.outerHTML});
            journal.render(false);
        });
    }
    static getInputValue(element){
        return element.type === "number" ? Number(element.value):
            element.type === "text" ? element.value :
                element.type === "checkbox" && element.checked ? true :
                    element.type === "checkbox" ? false : "";
    }
    /*data = data of containing class
     * content = content to be sanitized and used
     * target = path to content
     */
    static mce(data,content,target){
        const editor = Handlebars.helpers.editor({
            data:{
                root:data
            },hash:{
                button:true,
                content:content,
                editable:true,
                owner:true,
                target:target
            },
            name:"editor"
        });
        return editor;
    }
}
enrichHTML = IncarnateGamingLLC.Reference.enrichHTML;
