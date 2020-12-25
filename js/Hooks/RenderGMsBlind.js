/*
 * Sets region folder to current one in settings
 * Allows region to not reset to first in list whenever a new GMsScreen is deployed
 */
Hooks.on("renderGMsScreen", (context, html, data) => {
    const currentRegion = game.settings.get("incarnateWorldBuilding","incRegions").currentRegion;
    var select = $(html)[0].getElementsByClassName("incarnate-journalListing")[0];
    var options = select.options;
    for (var option, a=0; option = options[a]; a++){
        if (option.value === currentRegion){
            select.selectedIndex = a;
            break;
        }
    }
});
