console.warn('loading importTables.js');
IncarnateGamingLLC.ImportTables = class ImportTables {
    static async import(){
        let ugf = await IncarnateGamingLLC.DataImport.getData();
        //TODO add javascript import
        // let tablesXml = ugf.getElementsByClassName('rollable-table');
        // console.log(tablesXml);
    }
}
