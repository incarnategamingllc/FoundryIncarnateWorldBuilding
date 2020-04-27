/**
 * The random dungeon generator
 * @type {IncarnateGamingLLC.DungeonGenerator}
 */
IncarnateGamingLLC.DungeonGenerator = class DungeonGenerator extends IncarnateGamingLLC.SceneGen{
    static async newDungeon(name,width,height){
        const settings = game.settings.get("incarnate","incSceneGenSettings");
        width = Number(width) || Number(settings.width) || 3000;
        height = Number(height) || Number(settings.height) || 3000;
        if (typeof name === "object"){
            if (settings.title !== ""){
                name = settings.title;
            }else{
                name = "Dungeon " + settings.sceneCount;
                settings.sceneCount++;
                game.settings.set("incarnate","incSceneGenSettings",settings);
            }
        }
        const scene = await CONFIG.Scene.entityClass.create({name:name,flags:{dungeon:settings.dungeon},width:width,height:height});
        const newDungeon = await IncarnateGamingLLC.DungeonGenerator.dungeonGeneration(scene, settings.dungeon.rooms, settings.dungeon.roomMinL, settings.dungeon.roomMaxL, settings.dungeon.hallWidth);
        const dungeonWalls = await IncarnateGamingLLC.DungeonGenerator.dungeonWalls(newDungeon.drawings);
        let walls = dungeonWalls.walls,
            drawings = dungeonWalls.drawings,
            notes = [];
        if (settings.dungeon.traceWalls === true){
            const dungeonTraceWalls = await IncarnateGamingLLC.DungeonGenerator.dungeonTraceWalls(walls,drawings);
            walls = dungeonTraceWalls.walls;
            drawings = dungeonTraceWalls.drawings;
        }
        if (settings.dungeon.roomDesc === true){
            const dungeonRoomDesc = await IncarnateGamingLLC.DungeonGenerator.dungeonRoomDesc(drawings,notes);
            drawings = dungeonRoomDesc.drawings;
            notes = dungeonRoomDesc.notes;
        }
        scene.update({drawings:drawings,notes:notes,walls:walls});
    }
    static async dungeonGeneration(scene,rooms,roomMinL,roomMaxL,hallWidth,breakAfter){
        const settings = game.settings.get("incarnate","incSceneGenSettings");
        scene = scene || game.scenes.active;
        rooms = Number(rooms) || 5;
        const sceneGrid = Number(scene.data.grid);
        roomMinL = Number(roomMinL) * sceneGrid || 400;
        roomMaxL = Number(roomMaxL) * sceneGrid || 1000;
        breakAfter = Number(breakAfter) || 50;
        //roomMinL removed to prevent over-extending, sceneGrid added to compensate for rounding
        const sceneBorderWidth = Math.ceil(Number(scene.data.width) *.1/sceneGrid)*sceneGrid;
        const sceneBorderHeight = Math.ceil(Number(scene.data.height) *.1/sceneGrid)*sceneGrid;
        const sceneWidth = Number(scene.data.width)*1.2 - roomMinL + sceneGrid;
        const sceneHeight = Number(scene.data.height)*1.2 - roomMinL + sceneGrid;
        hallWidth = Number(hallWidth)* sceneGrid || 2 * sceneGrid;
        const drawings =[];
        let reservedId = 1
        let hallId = rooms * 2;
        let dunId = rooms * 2 + hallId;
        if (settings.dungeon.floor !== ""){
            let tempRoom = IncarnateGamingLLC.DungeonGenerator.drawingObject();
            tempRoom.type = "r";
            tempRoom.flags.type="floor";
            tempRoom.texture = settings.dungeon.floor;
            tempRoom.fillType = 2;
            tempRoom.fillColor = settings.dungeon.floorColor !== "" ? settings.dungeon.floorColor : "#000000";
            tempRoom.id = reservedId;
            reservedId++;
            tempRoom.x = sceneGrid;
            tempRoom.y = sceneGrid;
            tempRoom.width = Number(scene.data.width)*1.5 - sceneGrid*2;
            tempRoom.height = Number(scene.data.height)*1.5 - sceneGrid*2;
            tempRoom.strokeWidth = 0;
            drawings.push(tempRoom);
        }
        let checkCollide;
        for (let a=0; a<rooms; a++){
            let tempRoom = IncarnateGamingLLC.DungeonGenerator.drawingObject();
            let forceContinue = 0;
            do{
                tempRoom.type = "r";
                tempRoom.flags = {
                    type:"room",
                    walls:[],
                    regular:true
                }
                tempRoom.fillColor= settings.dungeon.roomColor !== "" ? settings.dungeon.roomColor : "#ffbe7d";
                tempRoom.fillType= settings.dungeon.room === "" ? 1 : 2;
                tempRoom.texture = settings.dungeon.room;
                tempRoom.strokeWidth = 0;
                tempRoom.id = dunId;
                tempRoom.x = Math.floor(sceneWidth * Math.random() / sceneGrid) * sceneGrid + sceneBorderWidth;
                tempRoom.y = Math.floor(sceneHeight * Math.random() / sceneGrid) * sceneGrid + sceneBorderHeight;
                tempRoom.height = Math.ceil(((roomMaxL - roomMinL) * Math.random() + roomMinL) /sceneGrid) * sceneGrid;
                tempRoom.width = Math.ceil(((roomMaxL - roomMinL) * Math.random() + roomMinL)/ sceneGrid) * sceneGrid;
                IncarnateGamingLLC.rollCount += 4;
                forceContinue++;
                let roomDrawings = drawings.filter(room => room.flags.type === "room");
                checkCollide = IncarnateGamingLLC.DungeonGenerator.checkCollide(tempRoom,roomDrawings,0);
            }while(forceContinue<breakAfter && checkCollide);
            if (forceContinue < breakAfter) drawings.push(tempRoom);
            dunId++;
        }
        rooms = drawings.filter(drawing => drawing.flags.type === "room");
        let roomsParsed = [];
        rooms.forEach(room =>{
            let preppedRoom = IncarnateGamingLLC.DungeonGenerator.parseDrawingLocation(room);
            preppedRoom.id = room.id;
            roomsParsed.push(preppedRoom);
        });
        let path = IncarnateGamingLLC.DungeonGenerator.drawingObject();
        path.flags={type:"path",roomsParsed:[]};
        path.type="p";
        path.id = reservedId;
        path.strokeAlpha = 0;
        path.strokeWidth = 0;
        reservedId++;
        let trackPoint = [0,0];
        let distanceOff = 10000000;
        let searchPoint;
        while (roomsParsed.length > 0){
            let tempTrackPoint;
            for (let a=0; a<roomsParsed.length; a++){
                let distance = Math.sqrt(Math.pow((trackPoint[0]-roomsParsed[a].center[0]),2)+Math.pow((trackPoint[1]-roomsParsed[a].center[1]),2));
                if (distance < distanceOff && distance > sceneGrid){
                    tempTrackPoint = roomsParsed[a].center;
                    distanceOff = distance;
                    searchPoint = a;
                }
            }
            trackPoint = tempTrackPoint;
            path.flags.roomsParsed.push(roomsParsed[searchPoint]);
            path.points.push(trackPoint);
            roomsParsed.splice(searchPoint,1);
            distanceOff = 1000000;
        }
        drawings.push(path);
        let pathLen = path.flags.roomsParsed.length -1;
        for (let a=0; a<pathLen; a++){
            let room1 = path.flags.roomsParsed.find(drawing => drawing.id === path.flags.roomsParsed[a].id);
            let room2 = path.flags.roomsParsed.find(drawing => drawing.id === path.flags.roomsParsed[a+1].id);
            let tempHall = IncarnateGamingLLC.DungeonGenerator.drawingObject();
            tempHall.flags = {
                type:"hall",
                walls:[],
                regular:true
            };
            tempHall.type="r";
            tempHall.id = hallId;
            hallId++;
            tempHall.fillColor = settings.dungeon.hallColor !== "" ? settings.dungeon.hallColor : "#ffbe7d";
            tempHall.fillType = settings.dungeon.hall === "" ? 1 : 2;
            tempHall.texture = settings.dungeon.hall;
            tempHall.strokeWidth = 0;
            if (room1.top >= room2.top && room1.top + hallWidth <= room2.bottom){
                tempHall.y = Math.round(((room2.bottom - hallWidth - room1.top) * Math.random() + room1.top)/sceneGrid) * sceneGrid;
                tempHall.height = hallWidth;
                if (room1.left < room2.left){
                    tempHall.x = room1.right;
                    tempHall.width = room2.left - room1.right;
                }else{
                    tempHall.x = room2.right;
                    tempHall.width = room1.left - room2.right;
                }
            }else if (room1.bottom - hallWidth >= room2.top && room1.bottom <= room2.bottom){
                tempHall.y = Math.round(((room1.bottom - hallWidth - room2.top) * Math.random() + room2.top)/sceneGrid) * sceneGrid;
                tempHall.height = hallWidth;
                if (room1.left < room2.left){
                    tempHall.x = room1.right;
                    tempHall.width = room2.left - room1.right;
                }else{
                    tempHall.x = room2.right;
                    tempHall.width = room1.left - room2.right;
                }
            }else if (room1.top <= room2.top && room1.bottom >= room2.bottom){
                tempHall.y = Math.round(((room2.bottom - hallWidth - room2.top) * Math.random() + room2.top)/sceneGrid) * sceneGrid;
                tempHall.height = hallWidth;
                if (room1.left < room2.left){
                    tempHall.x = room1.right;
                    tempHall.width = room2.left - room1.right;
                }else{
                    tempHall.x = room2.right;
                    tempHall.width = room1.left - room2.right;
                }
            }else if (room1.left >= room2.left && room1.left + hallWidth <= room2.right){
                tempHall.x = Math.round(((room2.right - hallWidth - room1.left) * Math.random() + room1.left)/sceneGrid) * sceneGrid;
                tempHall.width = hallWidth;
                if (room1.top < room2.top){
                    tempHall.y = room1.bottom;
                    tempHall.height = room2.top - room1.bottom;
                }else{
                    tempHall.y = room2.bottom;
                    tempHall.height = room1.top - room2.bottom;
                }
            }else if (room1.right - hallWidth >= room2.left && room1.right <= room2.right){
                tempHall.x = Math.round(((room1.right - hallWidth - room2.left) * Math.random() + room2.left)/sceneGrid) * sceneGrid;
                tempHall.width = hallWidth;
                if (room1.top < room2.top){
                    tempHall.y = room1.bottom;
                    tempHall.height = room2.top - room1.bottom;
                }else{
                    tempHall.y = room2.bottom;
                    tempHall.height = room1.top - room2.bottom;
                }
            }else if(room1.left < room2.left && room1.right > room2.right){
                tempHall.x = Math.round(((room2.right - hallWidth - room2.left) * Math.random() + room2.left)/sceneGrid) * sceneGrid;
                tempHall.width = hallWidth;
                if (room1.top < room2.top){
                    tempHall.y = room1.bottom;
                    tempHall.height = room2.top - room1.bottom;
                }else{
                    tempHall.y = room2.bottom;
                    tempHall.height = room1.top - room2.bottom;
                }
            }else {
                let tempY = JSON.parse(JSON.stringify(tempHall));
                tempY.id = hallId;
                hallId++;
                tempHall.height = hallWidth;
                tempY.width = hallWidth;
                if (room1.left < room2.left){
                    tempHall.x = room1.right;
                    tempHall.width = room2.left - room1.right + hallWidth;
                    if (room1.top < room2.top){
                        tempHall.y = room1.bottom - hallWidth;
                    }else{
                        tempHall.y = room1.top;
                    }
                }else{
                    tempHall.x = room2.right;
                    tempHall.width = room1.left - room2.right + hallWidth;
                    if (room2.top < room1.top){
                        tempHall.y = room2.bottom - hallWidth;
                    }else{
                        tempHall.y = room2.top;
                    }
                }
                if (room1.top < room2.top){
                    tempY.y = room1.bottom;
                    tempY.height = room2.top - room1.bottom;
                    if (room1.left < room2.left){
                        tempY.x = tempHall.x + tempHall.width - hallWidth;
                    }else{
                        tempY.x = tempHall.x + tempHall.width - hallWidth;
                    }
                }else{
                    tempY.y = room2.bottom;
                    tempY.height = room1.top - room2.bottom;
                    if (room1.left < room2.left){
                        tempY.x = tempHall.x + tempHall.width - hallWidth;
                    }else{
                        tempY.x = tempHall.x + tempHall.width - hallWidth;
                    }
                }
                if (tempY.height > 0) drawings.push(tempY);
            }
            if (tempHall.x > 10 && tempHall.y > 10 && tempHall.width > 0) drawings.push(tempHall);
        }
        return ({drawings:drawings});
    }
    static dungeonWalls(drawings){
        const settings = game.settings.get("incarnate","incSceneGenSettings");
        let walls = [];
        const rooms = drawings.filter(drawing => drawing.flags.type ==="room");
        const halls = drawings.filter(drawing => drawing.flags.type ==="hall");
        const roomsParsed =[];
        rooms.forEach(room=>{
            roomsParsed.push(IncarnateGamingLLC.DungeonGenerator.parseDrawingLocation(room));
        });
        const hallsParsed =[];
        halls.forEach(hall=>{
            hallsParsed.push(IncarnateGamingLLC.DungeonGenerator.parseDrawingLocation(hall));
        });
        const path = drawings.find(drawing => drawing.flags.type ==="path");
        let wallId = 1;
        for (let a=0; a<walls.length; a++){
            if (walls[a].id > wallId) wallId = walls[a].id;
        }
        for (let room=0; room<rooms.length; room++){
            let flagWalls = rooms[room].flags.walls;
            /* used to remove walls
            for (let flagWall in flagWalls){
                const target = walls.findIndex(wall => wall.id === flagWalls[flagWall]);
                if (target !== -1) walls.splice(target,1);
            }
            */
            flagWalls = [];
            const rectangleWalls = IncarnateGamingLLC.DungeonGenerator.rectangleWalls(rooms[room].x,rooms[room].y,rooms[room].width,rooms[room].height,wallId,hallsParsed,null,null,roomsParsed);
            wallId = rectangleWalls.id;
            walls = walls.concat(rectangleWalls.walls);
            for (let wall=0; wall < rectangleWalls.walls.length; wall++){
                flagWalls.push(rectangleWalls.walls[wall].id);
            }
        }
        const roomHallsParsed = roomsParsed.concat(hallsParsed);
        for (let hall=0; hall<halls.length; hall++){
            let flagWalls = halls[hall].flags.walls;
            /*
            for (let flagWall in flagWalls){
                const target = walls.findIndex(wall => wall.id === flagWalls[flagWall]);
                if (target !== -1) walls.splice(target,1);
            }
            */
            flagWalls = [];
            const rectangleHalls = IncarnateGamingLLC.DungeonGenerator.rectangleHalls(halls[hall].x,halls[hall].y,halls[hall].width,halls[hall].height,wallId,[],undefined,undefined,roomHallsParsed);
            wallId = rectangleHalls.id;
            walls = walls.concat(rectangleHalls.walls);
            for (let wall=0; wall<rectangleHalls.walls.length; wall++){
                flagWalls.push(rectangleHalls.walls[wall].id);
            }
        }
        let wallLen = walls.length;
        for (let a = 0; a < wallLen-1; a++){
            for (let b = a+1; b < wallLen; b++){
                //check for duplicate
                if (walls[a].c[0] === walls[b].c[0] && walls[a].c[1] === walls[b].c[1] && walls[a].c[2] === walls[b].c[2] && walls[a].c[3] === walls[b].c[3]){
                    //console.log(walls[a],walls[b]);
                    if(walls[a].flags.loc === walls[b].flags.loc){
                        walls[b].flags.duplicate = true;
                    }else{
                        walls[a].flags.duplicate = true;
                        walls[b].flags.duplicate = true;
                    }
                }
            }
        }
        /*
        for (let a=0; a<wallLen; a++){
            if (walls[a].flags.duplicate !== undefined){
                walls.splice(a,1);
                a--;
                wallLen = walls.length;
            }
        }
        */
        for (let a = 0; a < wallLen-1; a++){
            for (let b = a+1; b < wallLen; b++){
                //fix extension
                if (walls[a].door === walls[b].door && walls[a].move === walls[b].move && walls[a].sense === walls[b].sense){
                    if (walls[a].c[0] === walls[a].c[2] && walls[a].c[0] === walls[b].c[0] && walls[b].c[0] === walls[b].c[2]){
                        if (walls[a].c[1] === walls[b].c[1] || walls[a].c[3] === walls[b].c[3] || walls[a].c[1] === walls[b].c[3] || walls[a].c[3] === walls[b].c[1]){
                            let yPoints = [walls[a].c[1],walls[a].c[3],walls[b].c[1],walls[b].c[3]];
                            yPoints.sort((a,b) => a-b);
                            walls[a].c[1] = yPoints[0];
                            walls[a].c[3] = yPoints[3];
                            walls.splice(b,1);
                            a = a-1 < 0 ? 0 : a-1;
                            b = b-1 < 0 ? 0 : b-1;
                            wallLen = walls.length;
                        }
                    }else if (walls[a].c[1] === walls[a].c[3] && walls[a].c[1] === walls[b].c[1] && walls[b].c[1] === walls[b].c[3]){
                        if ((walls[a].c[0] === walls[b].c[0]) || (walls[a].c[2] === walls[b].c[2]) || (walls[a].c[0] === walls[b].c[2]) || (walls[a].c[2] === walls[b].c[0])){
                            let xPoints = [walls[a].c[0],walls[a].c[2],walls[b].c[0],walls[b].c[2]];
                            xPoints.sort((a,b) => a-b);
                            walls[a].c[0] = xPoints[0];
                            walls[a].c[2] = xPoints[3];
                            walls.splice(b,1);
                            a = a-1 < 0 ? 0 : a-1;
                            b = b-1 < 0 ? 0 : b-1;
                            wallLen = walls.length;
                        }
                    }
                }
            }
        }
        return {drawings:drawings,walls:walls};
    }
    static dungeonTraceWalls(walls,drawings){
        drawings = drawings.filter(drawing => drawing.flags === undefined || drawing.flags.type === undefined || drawing.flags.type !== "wall");
        let id = 1;
        drawings.forEach(drawing => id = drawing.id > id ? drawing.id : id);
        function test(wall){
            return wall.used === undefined && wall.sense === 1 && wall.move === 1 && (wall.door === 0 || wall.door === 2);
        }
        let wallOutline = [];
        let clonedWalls = JSON.parse(JSON.stringify(walls));
        let wallLen = walls.length;
        for (let a=0; a<wallLen; a++){
            let wall = clonedWalls[a];
            if (test(wall)){
                let points = [[wall.c[0],wall.c[1]],[wall.c[2],wall.c[3]]];
                wall.used = true;
                let currentPoint = [wall.c[2],wall.c[3]];
                let startPoint = [wall.c[0],wall.c[1]];
                let abortCount = 0;
                let found = false;
                do{
                    abortCount++;
                    found = false;
                    for (let b=0; b<wallLen; b++){
                        if (test(clonedWalls[b])){
                            if (clonedWalls[b].c[0] === currentPoint[0] && clonedWalls[b].c[1] === currentPoint[1]){
                                currentPoint = [clonedWalls[b].c[2],clonedWalls[b].c[3]];
                                points.push(currentPoint);
                                found = true;
                                clonedWalls[b].used = true;
                                break;
                            }else if (clonedWalls[b].c[2] === currentPoint[0] && clonedWalls[b].c[3] === currentPoint[1]){
                                currentPoint = [clonedWalls[b].c[0],clonedWalls[b].c[1]];
                                points.push(currentPoint);
                                found = true;
                                clonedWalls[b].used = true;
                                break;
                            }
                        }
                    }
                }while ((found === true && ((currentPoint[0] !== startPoint[0] && currentPoint[1] !== startPoint[1])||(currentPoint[0] === startPoint[0] && currentPoint[1] !== startPoint[1])||(currentPoint[0] !== startPoint[0] && currentPoint[0] === startPoint[0])))&& abortCount < 50);
                let left = 1000000000, top = 1000000000, right = 0, bottom = 0;
                points.forEach(point => {
                    left = left < point[0] ? left : point[0];
                    top = top < point[1] ? top : point[1];
                    right = right > point[0] ? right : point[0];
                    bottom = bottom > point[1] ? bottom : point[1];
                });
                const newDrawing = IncarnateGamingLLC.DungeonGenerator.drawingObject();
                newDrawing.flags.type = "wall";
                newDrawing.type = "p";
                newDrawing.x = left;
                newDrawing.y = top;
                newDrawing.width = right - left;
                newDrawing.height = bottom - top;
                id++;
                newDrawing.id = id;
                points.forEach(point => {
                    newDrawing.points.push([point[0]-left,point[1]-top]);
                });
                drawings.push(newDrawing);
            }else if (wall.used === undefined && wall.sense === 1 && wall.move === 1 && wall.door === 1){
            }
        }
        return {drawings:drawings,walls:walls};
    }
    static dungeonRoomDesc(drawings,notes){
        let id = 1;
        notes.forEach(note => {id = note.id > id ? note.id : id});
        const path = drawings.find(drawing => drawing.flags.type === "path");
        let note = {};
        if (path !== undefined && path.flags.roomsParsed.length > 2){
            const pathLen = path.flags.roomsParsed.length;
            //Set first room on path to entrance
            let currentRoom = drawings.find(drawing => drawing.id === path.flags.roomsParsed[0].id)
            if (currentRoom !== undefined && currentRoom.flags.note === undefined){
                note = IncarnateGamingLLC.DungeonGenerator.newNote(currentRoom,id);
                currentRoom.flags.note = id;
                id++;
                note.flags.template="Q6l2NFgPnN1in4vL",
                    note.flags.templateName="Cave Entrance"
                note.icon = "icons/svg/door-exit.svg";
                notes.push(note);
            }
            //Set second to last room on path to boss
            currentRoom = drawings.find(drawing => drawing.id === path.flags.roomsParsed[pathLen-2].id)
            if (currentRoom !== undefined && currentRoom.flags.note === undefined){
                note = IncarnateGamingLLC.DungeonGenerator.newNote(currentRoom,id);
                currentRoom.flags.note = id;
                id++;
                note.flags.template="Q6PL8n85Rh2eGLNm",
                    note.flags.templateName="Cave Boss Chamber"
                note.icon = "icons/svg/skull.svg";
                notes.push(note);
            }
            //Set last room on path to treasure
            currentRoom = drawings.find(drawing => drawing.id === path.flags.roomsParsed[pathLen-1].id)
            if (currentRoom !== undefined && currentRoom.flags.note === undefined){
                note = IncarnateGamingLLC.DungeonGenerator.newNote(currentRoom,id);
                currentRoom.flags.note = id;
                id++;
                note.flags.template="Q70b7Naw3dWkJsqA",
                    note.flags.templateName="Cave Treasure Chamber"
                note.icon = "icons/svg/ice-aura.svg";
                notes.push(note);
            }
        }else{
            let message = "Insufficient rooms for a lore based dungeon"
            alert(message);
            console.warn(message);
        }
        //Set all other rooms to normal rooms
        const otherRooms = drawings.filter(drawing => drawing.flags.type !== undefined && drawing.flags.type === "room");
        otherRooms.forEach(currentRoom =>{
            if (currentRoom !== undefined && currentRoom.flags.note === undefined){
                note = IncarnateGamingLLC.DungeonGenerator.newNote(currentRoom,id);
                currentRoom.flags.note = id;
                id++;
                notes.push(note);
            }else if (currentRoom !== undefined){
                notes = IncarnateGamingLLC.DungeonGenerator.moveNote(currentRoom,notes);
            }
        });
        return {drawings:drawings,notes:notes};
    }
    static moveRoomHall(walls, drawings, notes, scene){
        const updateWalls = new Promise(async (resolve,reject) =>{
            await IncarnateGamingLLC.Reference.incarnateDelay(300);
            walls = JSON.parse(JSON.stringify(scene.data.walls));
            drawings = JSON.parse(JSON.stringify(scene.data.drawings));
            const dungeonWalls = await IncarnateGamingLLC.DungeonGenerator.dungeonWalls(drawings);
            walls = dungeonWalls.walls;
            if (scene.data.flags !== undefined && scene.data.flags.dungeon !== undefined && scene.data.flags.dungeon.traceWalls === true){
                const dungeonTraceWalls = await IncarnateGamingLLC.DungeonGenerator.dungeonTraceWalls(walls,drawings);
                walls = dungeonTraceWalls.walls;
                drawings = dungeonTraceWalls.drawings;
            }else{
                drawings = drawings.filter(drawing => drawing.flags === undefined || drawing.flags.type === undefined || drawing.flags.type !== "wall");
            }
            if (scene.data.flags !== undefined && scene.data.flags.dungeon !== undefined && scene.data.flags.dungeon.roomDesc === true){
                const dungeonRoomDesc = await IncarnateGamingLLC.DungeonGenerator.dungeonRoomDesc(drawings,notes);
                drawings = dungeonRoomDesc.drawings;
                notes = dungeonRoomDesc.notes;
            }
            scene.update({drawings:drawings,notes:notes,walls:walls});
        });
        updateWalls.then();
        return true;
    }
}