/**
 *
 * @type {IncarnateGamingLLC.Dialog}
 */
IncarnateGamingLLC.DialogChange = class DialogChange extends Dialog{
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/incarnateWorldBuilding/templates/incarnateDialog.html";
        return options;
    }
    getData() {
        let buttons = Object.keys(this.data.buttons).reduce((obj, key) => {
            let b = this.data.buttons[key];
            if ( b.condition !== false ) obj[key] = b;
            return obj;
        }, {});
        return {
            content: this.data.content,
            buttons: buttons,
            selection: this.data.selection
        }
    }
}
