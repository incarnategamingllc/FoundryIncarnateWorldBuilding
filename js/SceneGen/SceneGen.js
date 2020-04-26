/**
 *
 * @type {IncarnateGamingLLC.SceneGen}
 */
IncarnateGamingLLC.SceneGen = class SceneGen{
    static incarnateSetupDefaults(){
        game.settings.register("incarnate","incSceneGenSettings", {
            name: "Scene Generation Options",
            hint: "Tracks the default options for random scene generation.",
            default: "",
            type: Object,
            scope: 'world',
            onChange: settings => {
                console.log(settings);
            }
        });
        if( game.settings.get("incarnate","incSceneGenSettings") !=""){
            return(game.settings.get("incarnate","incSceneGenSettings"));
        }else {
            console.log("Creating Scene Generate Settings");
            var tempSceneSet = SceneGen.defaultArray();
            game.settings.set("incarnate","incSceneGenSettings",tempSceneSet);
            return(tempSceneSet);
        }
    }
    static resetDefault(){
        console.log("Creating Scene Generate Settings");
        var tempSceneSet = SceneGen.defaultArray();
        game.settings.set("incarnate","incSceneGenSettings",tempSceneSet);
        return(tempSceneSet);
    }
    static defaultArray(){
        return {
            title:"",
            forest:{
                breakAfter:50,
                treeNum:100,
                treeSize:3,
                floor:"modules/incarnateAssets/Images/Textures/Stone002_0512.JPG",
                floorColor:"#000000",
                tree:"modules/incarnateAssets/Images/Textures/Wood001_0512.JPG",
                treeColor:"#000000",
                trunkSize:33
            },
            sceneCount:1,
            polygon:{
                minA:20,
                maxA:70,
                minL:10,
                maxL:50,
                x:300,
                y:300
            },
            dungeon:{
                breakAfter:50,
                hallWidth:2,
                randEnc:true,
                rooms:6,
                roomMinL:5,
                roomMaxL:10,
                roomDesc:true,
                traceWalls:true,
                floor:"modules/incarnateAssets/Images/Textures/Stone002_0512.JPG",
                floorColor:"#000000",
                room:"modules/incarnateAssets/Images/Textures/Wood001_0512.JPG",
                roomColor:"#000000",
                hall:"modules/incarnateAssets/Images/Textures/Wood001_0512.JPG",
                hallColor:"#000000"
            },
            width:3000,
            height:3000
        }
    }
    static drawingObject(){
        const user = game.userId;
        return {
            author:user,
            bezierFactor: 0.5,
            fillAlpha: 1,
            fillColor: "#000000",
            fillType: 0,
            flags:{
            },
            fontFamily:"Signika",
            fontSize:48,
            height:100,
            hidden:false,
            id:1,
            locked:false,
            points:[],
            rotation:0,
            strokeAlpha:1,
            strokeColor:"#000000",
            strokeWidth:12,
            textAlpha:0.5,
            textColor:"#FFFFFF",
            texture:"",
            type:"e",
            width:10,
            x:10,
            y:100,
            z:0
        }
    }
    static moveNote (drawing,notes){
        const note = notes.find(thisNote => thisNote.id === drawing.flags.note);
        if (note !== undefined){
            note.x= Number(drawing.x) + (Number(drawing.width)/2);
            note.y= Number(drawing.y) + (Number(drawing.height)/2);
        }
        return notes;
    }
    static newNote(drawing,id){
        return{
            entryId:"AAAAAAAAAAAAAAAA",
            flags:{
                tempType:"Dungeons",
                template:"Q6ZQjy8GHootEcak",
                templateName:"Cave Chamber",
                room:drawing.id
            },
            icon: "icons/svg/cave.svg",
            id: id,
            x: Number(drawing.x) + (Number(drawing.width)/2),
            y: Number(drawing.y) + (Number(drawing.height)/2)
        }
    }
    /*
     * colisionDrawings are an array of drawings that any overlaps need to be handled differently than an opaque wall
     * colisionType: {door:0,flags:{},move:1,:sense:1}
     * colisionDrawingsSkip: skips any walls that would enter into the zone of one of these drawings.
     */
    static rectangleWalls(x,y,width,height,startId,colisionDrawings,colisionType,normalType,colisionDrawingsSkip){
        x = width > 0 ? x : x + width;
        y = height > 0 ? y : y + height;
        width = Math.abs(width);
        height = Math.abs(height);
        colisionType = colisionType || {door:1,flags:{},move:1,sense:1};
        normalType = normalType || {door:0,flags:{},move:1,sense:1};
        var walls=[];
        var wallId = startId + 1;
        var tempWall = [x,y,x+width,y];
        var colisionCycle = SceneGen.wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,"top");
        walls = walls.concat(colisionCycle.walls);
        wallId = colisionCycle.id;
        tempWall = [x,y,x,y+height];
        var colisionCycle = SceneGen.wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,"left");
        walls = walls.concat(colisionCycle.walls);
        wallId = colisionCycle.id;
        tempWall = [x+width,y,x+width,y+height];
        var colisionCycle = SceneGen.wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,"right");
        walls = walls.concat(colisionCycle.walls);
        wallId = colisionCycle.id;
        tempWall = [x,y+height,x+width,y+height];
        var colisionCycle = SceneGen.wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,"bottom");
        walls = walls.concat(colisionCycle.walls);
        wallId = colisionCycle.id;
        return {walls:walls,id:wallId};
    }
    static rectangleHalls(x,y,width,height,startId,colisionDrawings,colisionType,normalType,colisionDrawingsSkip){
        x = width > 0 ? x : x + width;
        y = height > 0 ? y : y + height;
        width = Math.abs(width);
        height = Math.abs(height);
        colisionType = colisionType || {door:1,flags:{},move:1,sense:1};
        normalType = normalType || {door:0,flags:{},move:1,sense:1};
        var walls=[];
        var wallId = startId + 1;
        var tempWall = [x,y,x+width,y];
        var colisionCycle = SceneGen.wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,"top");
        walls = walls.concat(colisionCycle.walls);
        wallId = colisionCycle.id;
        tempWall = [x,y,x,y+height];
        var colisionCycle = SceneGen.wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,"left");
        walls = walls.concat(colisionCycle.walls);
        wallId = colisionCycle.id;
        tempWall = [x+width,y,x+width,y+height];
        var colisionCycle = SceneGen.wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,"right");
        walls = walls.concat(colisionCycle.walls);
        wallId = colisionCycle.id;
        tempWall = [x,y+height,x+width,y+height];
        var colisionCycle = SceneGen.wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,"bottom");
        walls = walls.concat(colisionCycle.walls);
        wallId = colisionCycle.id;
        return {walls:walls,id:wallId};
    }
    static wallColisionCycleHall(tempWall,colisionDrawingsSkip,normalType,wallId,position){
        var walls = [];
        var colisions = SceneGen.wallColision(tempWall,[],colisionDrawingsSkip);
        if (colisions.primary.length === 0 && colisions.secondary.length <= 1){
            var newWall = JSON.parse(JSON.stringify(normalType));
            newWall.c = tempWall;
            newWall.id = wallId;
            newWall.flags.loc = position;
            wallId++;
            walls.push(newWall);
        }else{
            var postSkips = SceneGen.wallColisionSkip(tempWall,colisions.secondary,position);
            postSkips.forEach(post => {
                var newWall = JSON.parse(JSON.stringify(normalType));
                newWall.c = post;
                newWall.id = wallId;
                newWall.flags.loc = position;
                wallId++;
                walls.push(newWall);
            });
        }
        return {walls:walls,id:wallId};
    }
    static wallColisionCycle(tempWall,colisionDrawings,colisionDrawingsSkip,normalType,colisionType,wallId,position){
        var walls = [];
        var colisions = SceneGen.wallColision(tempWall,colisionDrawings,colisionDrawingsSkip,position);
        if (colisions.primary.length === 0 && colisions.secondary.length <= 1){
            var newWall = JSON.parse(JSON.stringify(normalType));
            newWall.c = tempWall;
            newWall.id = wallId;
            newWall.flags.loc = position;
            wallId++;
            walls.push(newWall);
        }else{
            var postSkips = SceneGen.wallColisionSkip(tempWall,colisions.secondary,position);
            postSkips.forEach(post => {
                var colisionTran = SceneGen.wallColisionTransform(post,colisions.primary,wallId,normalType,colisionType,position);
                walls = walls.concat(colisionTran.walls);
                wallId =colisionTran.id;
            });
        }
        return {walls:walls,id:wallId};
    }
    static wallColisionTransform([x1,y1,x2,y2],colisions,wallId,normalType,colisionType,position){
        normalType = normalType || {door:0,flags:{},move:1,sense:1};
        colisionType = colisionType || {door:1,flags:{},move:1,sense:1};
        var newWall;
        const walls = [];
        if (x1 === x2){
            var yCurrent = y1 < y2 ? y1 : y2;
            var yEnd = y1 > y2 ? y1 : y2;
            colisions.sort((a,b) => a.top - b.top);
            colisions.forEach(colision =>{
                if (colision.top > yCurrent && colision.top <= yEnd && colision.top !== yCurrent){
                    newWall = JSON.parse(JSON.stringify(normalType));
                    newWall.c = [x1,yCurrent,x1,colision.top];
                    newWall.id = wallId;
                    newWall.flags.loc = position;
                    wallId++;
                    walls.push(newWall);
                    yCurrent = colision.top;
                }else if (colision.top > yEnd && yEnd !== yCurrent){
                    newWall = JSON.parse(JSON.stringify(normalType));
                    newWall.c = [x1,yCurrent,x1,yEnd];
                    newWall.id = wallId;
                    newWall.flags.loc = position;
                    wallId++;
                    walls.push(newWall);
                    yCurrent = yEnd;
                }
                if ((position === "left" && colision.left === x1)||(position ==="right" && colision.right === x1)){
                }else{
                    newWall = JSON.parse(JSON.stringify(colisionType));
                    var yTemp = colision.bottom >= yEnd ? yEnd :
                        colision.bottom > yCurrent ? colision.bottom : yCurrent;
                    if (yTemp !== yCurrent){
                        newWall.c = [x1,yCurrent,x1,yTemp];
                        newWall.id = wallId;
                        newWall.flags.loc = position;
                        wallId++;
                        walls.push(newWall);
                        yCurrent = yTemp;
                    }
                }
            });
            if (yCurrent < yEnd){
                newWall = JSON.parse(JSON.stringify(normalType));
                newWall.c = [x1,yCurrent,x1,yEnd];
                newWall.id = wallId;
                newWall.flags.loc = position;
                wallId++;
                walls.push(newWall);
            }
        }else if (y1 === y2){
            var xCurrent = x1 < x2 ? x1 : x2;
            var xEnd = x1 > x2 ? x1 : x2;
            colisions.sort((a,b) => a.left - b.left);
            colisions.forEach(colision =>{
                if (colision.left > xCurrent && colision.left <= xEnd && xCurrent !== colision.left){
                    newWall = JSON.parse(JSON.stringify(normalType));
                    newWall.c = [xCurrent,y1,colision.left,y1];
                    newWall.id = wallId;
                    newWall.flags.loc = position;
                    wallId++;
                    walls.push(newWall);
                    xCurrent = colision.left;
                }else if (colision.left > xEnd && xCurrent !== xEnd){
                    newWall = JSON.parse(JSON.stringify(normalType));
                    newWall.c = [xCurrent,y1,xEnd,y1];
                    newWall.id = wallId;
                    newWall.flags.loc = position;
                    wallId++;
                    walls.push(newWall);
                    xCurrent = xEnd;
                }
                if ((position ==="top" && colision.top ===y1)||(position==="bottom" && colision.bottom === y1)){
                }else{
                    newWall = JSON.parse(JSON.stringify(colisionType));
                    var xTemp = colision.right >= xEnd ? xEnd :
                        colision.right > xCurrent? colision.right : xCurrent;
                    if (xTemp !== xCurrent){
                        newWall.c = [xCurrent,y1,xTemp,y1];
                        newWall.id = wallId;
                        newWall.flags.loc = position;
                        wallId++;
                        walls.push(newWall);
                        xCurrent = xTemp;
                    }
                }
            });
            if (xCurrent < xEnd){
                newWall = JSON.parse(JSON.stringify(normalType));
                newWall.c = [xCurrent,y1,xEnd,y1];
                newWall.id = wallId;
                newWall.flags.loc = position;
                wallId++;
                walls.push(newWall);
            }
        }else{
        }
        return {walls:walls,id:wallId};
    }
    static wallColisionSkip([x1,y1,x2,y2],colisions,position){
        var a = [], encompassSelf = false, skipPart = false;
        if (colisions.length === 1){
            a.push([x1,y1,x2,y2]);
        }else if (x1 === x2){
            var yCurrent = y1 < y2 ? y1 : y2;
            var yStart = yCurrent;
            var yEnd = y1 > y2 ? y1 : y2;
            colisions.sort((a,b) => a.top - b.top);
            colisions.forEach(colision =>{
                if ((colision.top < yStart && colision.bottom >= yEnd)||(colision.top <= yStart && colision.bottom > yEnd)){
                    encompassSelf = true;
                }else if (colision.top > yCurrent){
                    if ((position ==="left" && colision.left === x1)||(position ==="right" && colision.right === x1)){
                    }else{
                        var yTemp = colision.top < yEnd ? colision.top : yEnd;
                        a.push([x1,yCurrent,x1,yTemp]);
                        skipPart = true;
                        yCurrent = colision.bottom < yEnd ? colision.bottom : yEnd;
                    }
                }else if(colision.top === yStart && colision.bottom === yEnd){
                    if ((position ==="left" && colision.right === x1)||(position ==="right" && colision.left === x1)){
                        yCurrent = colision.bottom < yEnd ? colision.bottom : yEnd;
                    }
                }else if (colision.top <= yCurrent){
                    if ((position ==="left" && colision.left === x1)||(position ==="right" && colision.right === x1)){
                    }else{
                        yCurrent = colision.bottom >= yEnd ? yEnd :
                            colision.bottom > yCurrent ? colision.bottom : yCurrent;
                    }
                }
            });
            if (yCurrent < yEnd) a.push([x1,yCurrent,x1,yEnd]);
        }else if (y1 === y2){
            var xCurrent = x1 < x2 ? x1 : x2;
            var xStart = xCurrent;
            var xEnd = x1 > x2 ? x1 : x2;
            colisions.sort((a,b) => a.left - b.left);
            colisions.forEach(colision =>{
                if ((colision.left < xStart && colision.right >= xEnd)||(colision.left <= xStart && colision.right > xEnd)){
                    encompassSelf = true;
                }else if (colision.left > xCurrent){
                    if ((position === "top" && colision.top === y1)||(position === "bottom" && colision.bottom === y1)){
                    }else{
                        var xTemp = colision.left < xEnd ? colision.left : xEnd;
                        a.push([xCurrent,y1,xTemp,y1]);
                        skipPart = true;
                        xCurrent = colision.right < xEnd ? colision.right : xEnd;
                    }
                }else if (colision.left === xStart && colision.right === xEnd){
                    if ((position === "bottom" && colision.top ===y1)||(position === "top" && colision.bottom === y1)){
                        xCurrent = colision.right < xEnd ? colision.right : xEnd;
                    }
                }else if (colision.left <= xCurrent){
                    if ((position === "top" && colision.top === y1)||(position === "bottom" && colision.bottom === y1)){
                    }else{
                        xCurrent = colision.right >= xEnd ? xEnd :
                            colision.right > xCurrent ? colision.right : xCurrent;
                    }
                }
            });
            if (xCurrent < xEnd) a.push([xCurrent,y1,xEnd,y1]);
        }else{
        }
        if (encompassSelf === true){
            a = [];
        }else if (a.length === 0 && skipPart === true){
            a.push([x1,y1,x2,y2]);
        }
        return a;
    }
    static wallColision ([x1,y1,x2,y2],colisionPrimary,colisionSecondary){
        const top = y1 < y2 ? y1 : y2;
        const bottom = y1 > y2 ? y1 : y2;
        const left = x1 < x2 ? x1 : x2;
        const right = x1 > x2 ? x1 : x2;
        const primary = [];
        const secondary =[];
        const col1 = colisionPrimary || [];
        const col2 = colisionSecondary || [];
        if (y1 === y2){
            for (var a=0; a<col1.length; a++){
                if (col1[a].top <= y1 && col1[a].bottom >= y1 && ((col1[a].left >= left && col1[a].left <= right)||(col1[a].right >= left && col1[a].right <= right)||(col1[a].left <= left && col1[a].right >= right))){
                    primary.push(col1[a])
                }
            }
            for (var a=0; a<col2.length; a++){
                if (col2[a].top <= y1 && col2[a].bottom >= y1 && ((col2[a].left >= left && col2[a].left <= right)||(col2[a].right >= left && col2[a].right <= right)||(col2[a].left <= left && col2[a].right >= right))){
                    secondary.push(col2[a])
                }
            }
        }else if (x1 == x2){
            for (var a=0; a<col1.length; a++){
                if(col1[a].left <= x1 && col1[a].right >= x1 && ((col1[a].top >= top && col1[a].top <= bottom)||(col1[a].bottom >= top && col1[a].bottom <= bottom)||(col1[a].top <= top && col1[a].bottom >= bottom))){
                    primary.push(col1[a]);
                }
            }
            for (var a=0; a<col2.length; a++){
                if(col2[a].left <= x1 && col2[a].right >= x1 && ((col2[a].top >= top && col2[a].top <= bottom)||(col2[a].bottom >= top && col2[a].bottom <= bottom)||(col2[a].top <= top && col2[a].bottom >= bottom))){
                    secondary.push(col2[a]);
                }
            }
        }else {
        }
        return ({primary:primary,secondary:secondary});
    }
    static makePolygon (id,x,y,sceneId,minA,maxA,minL,maxL){
        id = Number(id) || 1;
        x = Number(x) || 300;
        y = Number(y) || 300;
        minA = Number(minA) > 90 ? 0:
            Number(minA) < 0 ? 0 :
                Number(Number(minA)/180*Math.PI)? Number(Number(minA)/180*Math.PI) : 0;
        maxA = Number(maxA) > 90 ? Math.PI/2:
            Number(maxA) < 0 ? Math.PI/2:
                Number(Number(maxA)/180*Math.PI)? Number(Number(maxA)/180*Math.PI) : Math.PI/2;
        console.log(minA*180/Math.PI,maxA*180/Math.PI);
        minL = Number(minL) || 50;
        maxL = Number(maxL) || 200;
        const user = game.userId;
        sceneId = sceneId || game.scenes.active.data._id;
        const scene = game.scenes.get(sceneId);
        console.log(scene);
        var drawing = SceneGen.drawingObject();
        drawing.flags = {walls:[]};
        drawing.type = "p";
        drawing.fillColor="#004000";
        drawing.id=id;
        drawing.x=x;
        drawing.y=y;
        drawing.points.push([0,0]);
        const pointOrigin = [0,0];
        const width = scene.data.width * 1.2, height = scene.data.height * 1.2;
        var currentAngle = Math.PI /2 + this.angle(minA,maxA);
        var currentLength = this.length(minL,maxL);
        var tempX = Math.cos(currentAngle) * currentLength;
        var tempY = Math.sin(currentAngle) * currentLength;
        tempX = (tempX + x) < 0 ? 0-x :
            (tempX + x) > width -x ? width : tempX;
        tempY = (tempY + y) < 0 ? 0-y :
            (tempY + y) > height -y ? height : tempY;
        var previousPoint1 = [tempX,tempY];
        const secondPoint = [tempX,tempY];
        var previousAngle = currentAngle;
        drawing.points.push([tempX,tempY]);
        currentAngle = 5/4*Math.PI;
        do{
            currentAngle = previousAngle - this.angle(minA,maxA);
            var currentLength = this.length(minL,maxL);
            var tempX = Math.cos(currentAngle) * currentLength + previousPoint1[0];
            var tempY = Math.sin(currentAngle) * currentLength + previousPoint1[1];
            tempX = (tempX + x) < 0 ? 0-x :
                (tempX + x) > width -x ? width : tempX;
            tempY = (tempY + y) < 0 ? 0-y :
                (tempY + y) > height -y ? height : tempY;
            console.log(tempX,tempY);
            if (tempX > secondPoint[0]){
                if (currentAngle < -Math.PI/2){
                    if (tempX > pointOrigin[0] && tempY < pointOrigin[1]){
                        drawing.points.push([tempX,tempY]);
                        previousPoint1 = [tempX,tempY];
                    }
                }else {
                    drawing.points.push([tempX,tempY]);
                    previousPoint1 = [tempX,tempY];
                }
            }
            previousAngle = currentAngle;
        }while (currentAngle > -Math.PI);
        console.log(drawing.points);
        var maxX=0, minX=0, maxY=0, minY=0;
        drawing.points.forEach(point => {
            if (point[0] > maxX) maxX = point[0];
            if (point[0] < minX) minX = point[0];
            if (point[1] > maxY) maxY = point[1];
            if (point[1] < minY) minY = point[1];
        });
        drawing.height = Math.ceil(maxY - minY);
        drawing.width = Math.ceil(maxX - minX);
        const drawings = [drawing];
        console.log(drawings);
        game.scenes.active.update({drawings:drawings});
    }
    static angle (minA, maxA){
        IncarnateGamingLLC.rollCount++;
        return (maxA - minA) * Math.random() + minA
    }
    static length (minL, maxL){
        IncarnateGamingLLC.rollCount++;
        return (maxL - minL) * Math.random() + minL
    }
    static checkCollide (drawing,drawings,allowance){
        allowance = allowance || 0;
        const drawingLen = drawings.length;
        const parsedDrawing = SceneGen.parseDrawingLocation(drawing);
        for (var drawingLenVar = 0; drawingLenVar < drawingLen; drawingLenVar++){
            const drawParse = SceneGen.parseDrawingLocation(drawings[drawingLenVar]);
            if ((((drawParse.left - allowance >= parsedDrawing.left)&&(drawParse.left + allowance <= parsedDrawing.right))||((drawParse.right - allowance >= parsedDrawing.left)&&(drawParse.right + allowance <= parsedDrawing.right)))&&(((drawParse.top - allowance >= parsedDrawing.top)&&(drawParse.top + allowance <= parsedDrawing.bottom))||((drawParse.bottom - allowance >= parsedDrawing.top)&&(drawParse.bottom + allowance <= parsedDrawing.bottom)))){
                return true;
            }else if ((((parsedDrawing.left - allowance >= drawParse.left)&&(parsedDrawing.left + allowance <= drawParse.right))||((parsedDrawing.right - allowance >= drawParse.left)&&(parsedDrawing.right + allowance <= drawParse.right)))&&(((parsedDrawing.top - allowance >= drawParse.top)&&(parsedDrawing.top + allowance <= drawParse.bottom))||((parsedDrawing.bottom - allowance >= drawParse.top)&&(parsedDrawing.bottom + allowance <= drawParse.bottom)))){
                return true;
            }else if (drawParse.top < parsedDrawing.top && drawParse.bottom > parsedDrawing.bottom && drawParse.left > parsedDrawing.left && drawParse.right < parsedDrawing.right){
                return true;
            }else if (drawParse.top > parsedDrawing.top && drawParse.bottom < parsedDrawing.bottom && drawParse.left < parsedDrawing.left && drawParse.right > parsedDrawing.right){
                return true;
            }
        }
        return false;
    }
    static parseDrawingLocation(drawing){
        const result = {};
        if (drawing.type === "e" || drawing.type ==="r"){
            result.top = Number(drawing.height) > 0 ? Number(drawing.y) : Number(drawing.y) + Number(drawing.height);
            result.left = Number(drawing.width) > 0 ? Number(drawing.x) : Number(drawing.width) + Number(drawing.x);
            result.bottom = Number(drawing.height) > 0 ? Number(drawing.y) + Number(drawing.height) : Number (drawing.y);
            result.right = Number(drawing.width) > 0 ? Number(drawing.x) + Number(drawing.width) : Number(drawing.x);
            result.center = [Number(result.left) + (Number(result.right)-Number(result.left))/2,Number(result.top) + (Number(result.right)-Number(result.left))/2];
        }else if (drawing.type === "p" || drawing.type ==="f"){
            result.top = Number(drawing.height) > 0 ? Number(drawing.y) : Number(drawing.y) + Number(drawing.height);
            result.left = Number(drawing.width) > 0 ? Number(drawing.x) : Number(drawing.width) + Number(drawing.x);
            result.bottom = Number(drawing.height) > 0 ? Number(drawing.y) + Number(drawing.height) : Number (drawing.y);
            result.right = Number(drawing.width) > 0 ? Number(drawing.x) + Number(drawing.width) : Number(drawing.x);
            result.center = [Number(result.left) + (Number(result.right)-Number(result.left))/2,Number(result.top) + (Number(result.right)-Number(result.left))/2];
        }else{
            console.log("Cannot parse drawings of type: ",drawing.type);
            return(false);
        }
        return result;
    }
}
