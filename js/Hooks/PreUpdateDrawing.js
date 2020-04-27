Hooks.on("preUpdateDrawing", async (sceneIn, drawingIn, drawingDelta) =>{
    const drawing = sceneIn;
    if (sceneIn === undefined || sceneIn.data === undefined || sceneIn.data.flags === undefined) return true;
    const scene = game.scenes.get(sceneIn._id);
    const sceneWalls = IncarnateGamingLLC.deepCopy(scene.data.walls);
    let drawings = IncarnateGamingLLC.deepCopy(scene.data.drawings);
    let walls = IncarnateGamingLLC.deepCopy(scene.data.walls);
    let notes = IncarnateGamingLLC.deepCopy(scene.data.notes);
    //const drawing = drawings.find(source => source.id === a.data.id);
    if (drawingIn.flags.type === "tree"){
        return IncarnateGamingLLC.ForestGenerator.moveTree(sceneIn, drawingDelta, sceneWalls, scene, drawing, drawings);
    }else if (drawingIn.flags.type === "room"|| drawingIn.flags.type ==="hall"){
        return IncarnateGamingLLC.DungeonGenerator.moveRoomHall(walls, drawings, notes, scene);
    }
});
