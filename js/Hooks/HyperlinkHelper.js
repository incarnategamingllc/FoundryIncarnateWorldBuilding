/**
 * Holds helper functions for adding hyperlinks to various parts
 * of the code
 * @type {IncarnateGamingLLC.HyperlinkHelper}
 */
IncarnateGamingLLC.HyperlinkHelper = class HyperlinkHelper{
    /**
     * Takes a JQuery html node from a template
     * @param html
     */
    static addHyperlinkSupport(html, sheet){
        if(!html) return true;
        this.addHyperlinkSupportToDOM(html, sheet);
    }
    static addHyperlinkSupportToDOM(html, sheet){
        let htmlDOM = html[0];
        if(!htmlDOM) return true;
        IncarnateGamingLLC.Reference.crossReferenceSetClick(htmlDOM);
        IncarnateGamingLLC.Reference.populateSetClick(htmlDOM);
        IncarnateGamingLLC.Reference.secretSetContext(htmlDOM, sheet);
        IncarnateGamingLLC.Reference.rollMacroSetClick(htmlDOM);
    }
}