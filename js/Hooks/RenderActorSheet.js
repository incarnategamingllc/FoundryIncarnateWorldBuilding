Hooks.on("renderActorSheet", (actorSheet,html,data) => {
    IncarnateGamingLLC.HyperlinkHelper.addHyperlinkSupport(html, actorSheet);
});
