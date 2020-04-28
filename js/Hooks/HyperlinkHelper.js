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
    static addHyperlinkSupport(html){
        var htmlDOM = html[0];
        this.addHyperlinkSupportToDOM(htmlDOM, html);
    }
    static addHyperlinkSupportToDOM(htmlDOM, html){
        if (htmlDOM === undefined) return true;
        IncarnateGamingLLC.Reference.crossReferenceSetClick(htmlDOM);
        IncarnateGamingLLC.Reference.populateSetClick(htmlDOM);
        IncarnateGamingLLC.Reference.secretSetContext(html[0],context);
        IncarnateGamingLLC.Reference.rollMacroSetClick(htmlDOM);
        html = $(htmlDOM);
    }
}