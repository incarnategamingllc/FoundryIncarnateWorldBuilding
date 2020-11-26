IncarnateGamingLLC.DataImport = class DataImport {
    static getData() {
        return new Promise((resolve, reject)=>{
            let ugf = new XMLHttpRequest();
            ugf.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    resolve(this.responseXML);
                }
            };
            ugf.open("GET", "modules/incarnateWorldBuilding/packs/Incarnate-System.xml", true);
            ugf.send();
        })
    }
}
