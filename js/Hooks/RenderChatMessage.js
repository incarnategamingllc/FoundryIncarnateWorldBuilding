Hooks.on("renderChatMessage", (context,messageData,html) => {
    IncarnateGamingLLC.HyperlinkHelper.addHyperlinkSupport(html);
});
