/**
 * Parent class that holds all class, functions, and variables
 * created by IncarnateGamingLLC to prevent name collisions with
 * other modules.
 */
class IncarnateGamingLLC{
    /**
     * Counts the number of rolls made by the Incarnate System this session
     * @type {number}
     */
    static rollCount = 0;

    /**
     * Performs a deep copy of an object returning a new object
     * that is independent of the other.
     * @param original
     * @returns {any}
     */
    static deepCopy(original){
        return JSON.parse(JSON.stringify(original));
    }

    /**
     * Returns a promise that will take a number of ms to return
     * @param ms milliseconds
     * @returns {Promise<>}
     */
    static delay(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static createElementFromHTML(htmlString){
        let div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    }

    static pushObjectIntoObject(parent, newChild){
        let keys = Object.keys(parent);
        let newKey;
        if(keys.length > 0){
            keys.sort();
            let lastKey = keys[keys.length -1];
            newKey = isNaN(Number(lastKey)) ? lastKey + '1' : Number(lastKey) + 1;
        }else{
            newKey = 0;
        }
        parent[newKey] = newChild
        return parent;
    }

    static findParentElementByClass(startElement, className){
        if(typeof className !== 'string')return false;
        let found = false;
        while(startElement && !found){
            if(startElement.classList.contains(className)){
                found = true;
            }else{
                startElement = startElement.parentElement;
            }
        }
        return startElement ? startElement : false;
    }

    static PLAYER_QUICK_SHEET = '<span class="crossReference" data-fid="g7NQ9CEj2AiLpxXs" data-type="JournalEntry" data-parent="HlyV9728fyQUUdDx" data-pack="world.incarnateRules">Player Quick Sheet</span>';
}