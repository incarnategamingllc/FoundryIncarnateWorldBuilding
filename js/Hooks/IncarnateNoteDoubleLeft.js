/**
 * Creates a double left click behavior on scene notes.
 */
Hooks.on("incarnateNoteDoubleLeft",(ev,note)=>{
    console.log(ev,note);
    if (note.data !== undefined && note.data.flags !== undefined && note.data.flags.template !== undefined && note.data.flags.template !== "" && note.data.flags.tempType !== " "){
        const newContent = IncarnateGamingLLC.Reference.populateTemplateInsert(note.data.flags.template).then(newContent =>{
            if (newContent.resultType === "Actor"){
                const newToken = JSON.parse(JSON.stringify(newContent.result.data.token));
                newToken.x = note.data.x;
                newToken.y = note.data.y;
                const incToken = Token.create(note.scene.data._id,newToken);
                incToken.then(result => {
                    result.draw();
                    note.delete(note.scene.data._id);
                });
            }else if (newContent.resultType === "JournalEntry"){
                var noteData = JSON.parse(JSON.stringify(note.data));
                noteData.flags = {template:"",tempType:""};
                noteData.entryId = newContent.result.data._id;
                note.update(noteData).then(returnedNote => {
                    returnedNote.draw();
                });
                newContent.result.sheet.render(true);
            }
        });
        return false;
    }
});
