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
        var htmlDom = html[0];
        this.addHyperlinkSupportToDOM(htmlDom, html);
    }
    static addHyperlinkSupportToDOM(htmlDOM, html){
        if (htmlDom === undefined) return true;
        IncarnateGamingLLC.Reference.crossReferenceSetClick(htmlDom);
        IncarnateGamingLLC.Reference.populateSetClick(htmlDom);
        IncarnateGamingLLC.Reference.secretSetContext(html[0],context);
        IncarnateGamingLLC.Reference.rollMacroSetClick(htmlDom);
        html = $(htmlDom);
    }
}