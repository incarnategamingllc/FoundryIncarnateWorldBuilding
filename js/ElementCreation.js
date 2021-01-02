IncarnateGamingLLC.ElementCreation = class ElementCreation{
    static cleanAttributeValue(string){
        if(!string) return '';
        return string.replace(' ', '-').toLowerCase();
    }
    static setClassAndId(value, element){
        element.setAttribute('class', value);
        element.setAttribute('id', value);
    }
    static createDiv(name){
        let result = document.createElement('div');
        let cleanName = IncarnateGamingLLC.ElementCreation.cleanAttributeValue(name);
        IncarnateGamingLLC.ElementCreation.setClassAndId(cleanName, result);
        return result;
    }
    static createDivWithHeader(name){
        let result = IncarnateGamingLLC.ElementCreation.createDiv(name);
        result.innerHTML = `<h1>${name}</h1>`;
        return result;
    }

    /**
     * Creates a clickable button with a plus sign out front
     * @param className
     * @param callbackFunction
     * @param options {div: true}
     */
    static createButtonAdd(className, callbackFunction, options = {}){
        let result;
        if(options.div){
            result = document.createElement('div');
        }else{
            result = document.createElement('button');
        }
        result.innerHTML = `<i class="fas fa-plus"></i>${className}`
        result.addEventListener('click', callbackFunction);
        let cleanName = IncarnateGamingLLC.ElementCreation.cleanAttributeValue(className);
        IncarnateGamingLLC.ElementCreation.setClassAndId(cleanName, result);
        return result;
    }
}