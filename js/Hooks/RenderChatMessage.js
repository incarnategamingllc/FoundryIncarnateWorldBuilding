Hooks.on("renderChatMessage", (chatMessage, html, jsonMessage) => {
    IncarnateGamingLLC.HyperlinkHelper.addHyperlinkSupport(html);
});
