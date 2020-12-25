/**
 * Forest Generator
 * @type {IncarnateGamingLLC.ForestGenerator}
 */
IncarnateGamingLLC.ForestGenerator = class ForestGenerator extends IncarnateGamingLLC.SceneGen{
    static async newForest(name,width,height){
        const settings = game.settings.get("incarnateWorldBuilding","incSceneGenSettings");
        width = Number(width) || Number(settings.width) || 3000;
        height = Number(height) || Number(settings.height) || 3000;
        if (typeof name === "object"){
            if (settings.title !== ""){
                name = settings.title;
            }else{
                name = "Forest " + settings.sceneCount;
                settings.sceneCount++;
                game.settings.set("incarnateWorldBuilding","incSceneGenSettings",settings);
            }
        }
        const scene = await CONFIG.Scene.entityClass.create({name:name,width:width,height:height});
        IncarnateGamingLLC.ForestGenerator.forestGeneration(settings.forest.treeNum, settings.forest.treeSize, settings.forest.trunkSize, settings.forest.breakAfter, scene);
    }
    static forestGeneration(treeNum,treeSize,trunkSize,breakAfter,scene){
        treeNum = Number(treeNum) || 100;
        treeSize = Number(treeSize) || 3;
        trunkSize = Number(trunkSize) || 33;
        breakAfter = Number(breakAfter) || 50;
        scene = scene || game.scenes.active;
        const sceneHeight = Number(scene.data.height) * 1.4;
        const sceneWidth = Number(scene.data.width) * 1.4;
        const sceneGrid = Number(scene.data.grid);
        const drawings = [];
        const walls = [];
        const user = game.userId;
        var id = 1, forceContinue=0, wallId = 1;
        for (var a=0; a<treeNum; a++){
            const sizeDirection = Math.random()>0.5 ? 1 : -1;
            const sizeMod = (Math.random() * 0.2 * sizeDirection) + 1;
            //const sizeMod = 1;
            const width = treeSize * sceneGrid *sizeMod, height= treeSize * sceneGrid *sizeMod;
            const trunk = trunkSize * width /100;
            const trunkSide = (width - trunk)/2;
            forceContinue=0;
            var drawing = IncarnateGamingLLC.SceneGen.drawingObject();
            drawing.id = id;
            drawing.flags = {
                type:"tree",
                walls:[],
                regular:true
            };
            drawing.fillType=1;
            drawing.fillAlpha=1;
            drawing.fillColor="#194C19";
            drawing.strokeWidth=2;
            drawing.width = width;
            drawing.height = height;
            do{
                drawing.x = Math.random() * sceneWidth;
                drawing.y = Math.random() * sceneHeight;
                IncarnateGamingLLC.rollCount += 2;
                forceContinue++;
                var checkCollide = IncarnateGamingLLC.SceneGen.checkCollide(drawing,drawings,sceneGrid/10);
            }while(checkCollide && forceContinue < breakAfter);
            if (forceContinue === breakAfter){
                break;
            }
            walls.push({
                c:[drawing.x+trunkSide,drawing.y+trunkSide,drawing.x + trunkSide,drawing.y+ trunkSide + trunk],
                door:0,
                flags:{
                    type:"tree"
                },
                id:wallId,
                move:1,
                sense:2
            });
            drawing.flags.walls.push(wallId);
            wallId++;
            walls.push({
                c:[drawing.x + trunkSide, drawing.y + trunkSide, drawing.x + trunk + trunkSide, drawing.y + trunkSide],
                door:0,
                flags:{
                    type:"tree"
                },
                id:wallId,
                move:1,
                sense:2
            });
            drawing.flags.walls.push(wallId);
            wallId++;
            walls.push({
                c:[drawing.x + trunkSide, drawing.y + trunkSide + trunk, drawing.x + trunkSide + trunk, drawing.y + trunkSide + trunk],
                door:0,
                flags:{
                    type:"tree"
                },
                id:wallId,
                move:1,
                sense:2
            });
            drawing.flags.walls.push(wallId);
            wallId++;
            walls.push({
                c:[drawing.x + trunkSide + trunk, drawing.y + trunkSide, drawing.x + trunkSide + trunk, drawing.y + trunkSide + trunk],
                door:0,
                flags:{
                    type:"tree"
                },
                id:wallId,
                move:1,
                sense:2
            });
            drawing.flags.walls.push(wallId);
            wallId++;
            drawings.push(drawing);
            id++;
        }
        scene.update({drawings:drawings,walls:walls});
    }
    static moveTree(sceneIn, drawingDelta, sceneWalls, scene, drawing, drawings){
        if (sceneIn.data.flags.walls === undefined) return true;
        for (let object in drawingDelta){
            drawing[object] = drawingDelta[object];
        }
        const boundWalls = sceneIn.data.flags.walls;
        if (sceneIn.data.flags.regular === true){
            boundWalls.forEach(wall => {
                const activeWall = sceneWalls.find(sceneWall => sceneWall.id === wall);
                var startingX = sceneIn.data.x;
                var startingY = sceneIn.data.y;
                if (drawingDelta.x !== undefined){
                    const cLength = activeWall.c.length;
                    for (let d=0; d<cLength; d+=2){
                        activeWall.c[d] = Math.floor(Math.floor(activeWall.c[d]) - Math.floor(sceneIn.data.x) + Math.floor(drawingDelta.x));
                    }
                    startingX = drawingDelta.x;
                }
                if (drawingDelta.y !== undefined){
                    const cLength = activeWall.c.length;
                    for (let d=1; d<cLength; d+=2){
                        activeWall.c[d] = Math.floor( Math.floor(activeWall.c[d]) - Math.floor(sceneIn.data.y) + Math.floor(drawingDelta.y));
                    }
                    startingY = drawingDelta.y;
                }
                if (drawingDelta.width !== undefined){
                    const cLength = activeWall.c.length;
                    const widthChange = Math.floor(drawingDelta.width) / Math.floor(sceneIn.data.width);
                    console.log(widthChange);
                    for (let d=0; d<cLength; d+=2){
                        console.log(activeWall.c[d]);
                        activeWall.c[d] = ((activeWall.c[d] - startingX) * widthChange) + startingX;
                        console.log(activeWall.c[d])
                    }
                }
                if (drawingDelta.height !== undefined){
                    const cLength = activeWall.c.length;
                    const heightChange = Math.floor(drawingDelta.height) / Math.floor(sceneIn.data.height);
                    console.log(heightChange);
                    for (let d=1; d<cLength; d+=2){
                        console.log(activeWall.c[d])
                        activeWall.c[d] = ((activeWall.c[d] - startingY) * heightChange) + startingY;
                        console.log(activeWall.c[d])
                    }
                }
            });
        }
        drawing.locked=false;
        scene.update({walls:sceneWalls,drawings:drawings});
        return false;
    }
}