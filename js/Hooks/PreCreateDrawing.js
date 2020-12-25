Hooks.on("preCreateDrawing", async (drawingClass,sceneId,data) =>{
    if (data.flags === undefined) return true;
    if (data.flags.type === undefined) return true;
    if (data.flags.type === "tree"){
        const settings = game.settings.get("incarnateWorldBuilding","incSceneGenSettings");
        const scene = game.scenes.get(sceneId)
        var drawings = JSON.parse(JSON.stringify(scene.data.drawings));
        var drawing = drawings.find(drawing=>drawing.id===data.id);
        var walls = JSON.parse(JSON.stringify(scene.data.walls));
        const width = data.width * settings.forest.trunkSize / 100;
        const height = data.height * settings.forest.trunkSize / 100;
        const x = data.x + ((data.width - width)/2);
        const y = data.y + ((data.height - height)/2);
        var id = 1;
        walls.forEach(wall =>{
            id = wall.id > id ? wall.id : id;
        });
        const rectangleWalls = IncarnateGamingLLC.SceneGen.rectangleWalls(x,y,width,height,id,undefined,undefined,{door:0,flags:{type:"tree"},move:1,sense:2});
        walls = walls.concat(rectangleWalls.walls);
        drawing.flags.walls =[];
        rectangleWalls.walls.forEach(wall =>{
            drawing.flags.walls.push(wall.id);
        });
        scene.update({walls:walls,drawings:drawings})
        return false;
    }
    return true;
});
