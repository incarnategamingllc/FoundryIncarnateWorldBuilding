Hooks.on("renderChatMessage", (chatMessage, html, data) => {
    IncarnateGamingLLC.HyperlinkHelper.addHyperlinkSupport(html, chatMessage);
});
