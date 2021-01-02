/**
 * Anvil Button Actions
 */
//Dropping on anvil feeds data to console
IncarnateGamingLLC.Anvil = class Anvil{
    static incarnateOnDragOver(event) {
        event.preventDefault();
        return false;
    }
    static incarnateOnDrop(event) {
        event.preventDefault();
        // Try to extract the data
        let data;
        console.log('isJSON', IncarnateGamingLLC.Reference.incarnateJSONCheck(event.dataTransfer.getData("text/plain")));
        data = JSON.parse(event.dataTransfer.getData('text/plain'));
        console.log("data",data);
    }
}
