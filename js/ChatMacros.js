IncarnateGamingLLC.ChatMacros = class ChatMacros{
    static patterns = {
        help : new RegExp('^\/help'),
        statRoll: new RegExp('^\/s(tat)?[rR](oll)?'),
        statAuditMe: new RegExp('^\/s(tat)?[aA](udit)?[mM](e)?'),
        statAuditHard: new RegExp('\/s(tat)?[Aa](udit)?[hH](ard)?'),
        statAudit: new RegExp('\/s(tat)?[Aa](udit)?'),
        gmScreen: new RegExp('\/gm[sS](creen)?'),
    }
    static parsePattern(message){
        // let key, regex, match;
        // for ([key, regex] of Object.entries(IncarnateGamingLLC.ChatMacros.patterns)){
        //     match = message.match(regex);
        //     if (match) return [key, match];
        // }
        return false;
    }
}
