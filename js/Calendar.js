/**
 * Adds a calendar tracker to handle changes according to game
 * time.
 * @type {IncarnateGamingLLC.Calendar}
 */
IncarnateGamingLLC.Calendar = class Calendar{
    static defaultCalendar = {
        "date":{
            "y":1,
            "m":1,
            "d":1,
            "h":0,
            "i":0,
            "s":0
        },
        "maxes":{
            "m":12,
            "d":30,
            "h":23,
            "i":59,
            "s":59
        },
        "monthNames":["Zota","Maco","Nita","Ridon","Dankil","Maso","Drite","Fami","Notrae","Tali","Alo","Sadil"]
    }
    /**
     * Calendar Prep
     */
    static incarnateSetupCalendar (){
        game.settings.register("incarnate","incCalendar", {
            name: "Calendar",
            hint: "Tracks game time",
            default: "",
            type: Object,
            scope: 'world',
            onChange: settings => {
                IncarnateGamingLLC.Calendar.updateDisplayedDates();
                console.log(settings);
            }
        });
        if( game.settings.get("incarnateWorldBuilding","incCalendar") !=""){
            return(game.settings.get("incarnateWorldBuilding","incCalendar"));
        }else {
            console.log("Creating Calendar Settings");
            game.settings.set("incarnateWorldBuilding","incCalendar", IncarnateGamingLLC.Calendar.defaultCalendar);
            return(IncarnateGamingLLC.Calendar.defaultCalendar);
        }
    }
    static yearChange(delta,calendar){
        if (calendar === undefined){
            calendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        }
        calendar.date.y = calendar.date.y+delta;
        game.settings.set("incarnateWorldBuilding","incCalendar",calendar);
    }
    static monthChange(delta,calendar){
        if (calendar === undefined){
            calendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        }
        calendar.date.m = calendar.date.m+delta;
        if (calendar.date.m > calendar.maxes.m){
            var change = Math.floor(calendar.date.m/calendar.maxes.m);
            calendar.date.m %= calendar.maxes.m;
            Calendar.yearChange(change,calendar);
        }else if (calendar.date.m <1){
            var change = Math.ceil(Math.abs(calendar.date.m)/calendar.maxes.m);
            calendar.date.m = calendar.date.m+change*calendar.maxes.m;
            Calendar.yearChange(-change,calendar);
        }else{
            game.settings.set("incarnateWorldBuilding","incCalendar",calendar);
        }
    }
    static dayChange(delta,calendar){
        if (calendar === undefined){
            calendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        }
        calendar.date.d = calendar.date.d+delta;
        if (calendar.date.d > calendar.maxes.d){
            var change = Math.floor(calendar.date.d / calendar.maxes.d);
            calendar.date.d = calendar.date.d%calendar.maxes.d;
            Calendar.monthChange(change,calendar);
        }else if (calendar.date.d <1){
            var change = Math.ceil(Math.abs(calendar.date.d)/calendar.maxes.d);
            calendar.date.d = calendar.date.d+change*calendar.maxes.d;
            Calendar.monthChange(-change,calendar);
        }else{
            game.settings.set("incarnateWorldBuilding","incCalendar",calendar);
        }
    }
    static hourChange(delta,calendar){
        if (calendar === undefined){
            calendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        }
        calendar.date.h = calendar.date.h+delta;
        if (calendar.date.h > calendar.maxes.h){
            var change = Math.floor(calendar.date.h / calendar.maxes.h);
            calendar.date.h = calendar.date.h % calendar.maxes.h;
            Calendar.dayChange(change,calendar);
        }else if (calendar.date.h <0){
            var change = Math.ceil(Math.abs(calendar.date.h)/calendar.maxes.h);
            calendar.date.h = calendar.date.h+change*calendar.maxes.h;
            Calendar.dayChange(-change,calendar);
        }else{
            game.settings.set("incarnateWorldBuilding","incCalendar",calendar);
        }
    }
    static minuteChange(delta,calendar){
        if (calendar === undefined){
            calendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        }
        calendar.date.i = calendar.date.i+delta;
        if (calendar.date.i > calendar.maxes.i){
            var change = Math.floor(calendar.date.i / calendar.maxes.i)
            calendar.date.i = calendar.date.i%calendar.maxes.i;
            Calendar.hourChange(change,calendar);
        }else if (calendar.date.i <0){
            var change = Math.ceil(Math.abs(calendar.date.i)/calendar.maxes.i);
            calendar.date.i = calendar.date.i+change*calendar.maxes.i;
            Calendar.hourChange(-change,calendar);
        }else{
            game.settings.set("incarnateWorldBuilding","incCalendar",calendar);
        }
    }
    static secondChange(delta,calendar){
        if (calendar === undefined){
            calendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        }
        calendar.date.s = calendar.date.s+delta;
        if (calendar.date.s > calendar.maxes.s){
            var change = Math.floor(calendar.date.s/calendar.maxes.s);
            calendar.date.s = calendar.date.s % calendar.maxes.s;
            Calendar.minuteChange(change,calendar);
        }else if (calendar.date.s <0){
            var change = Math.ceil(Math.abs(calendar.date.s)/calendar.maxes.s)
            calendar.date.s = calendar.date.s+change*calendar.maxes.s;
            Calendar.minuteChange(-change,calendar);
        }else{
            game.settings.set("incarnateWorldBuilding","incCalendar",calendar);
        }
    }
    static updateDisplayedDates(){
        let dateElements = document.getElementsByClassName('incarnate-calendar-date');
        let timeElements = document.getElementsByClassName('incarnate-calendar-time');
        let calendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        console.log('calendar', calendar);
        [].forEach.call(dateElements, dateElement=>{
            dateElement.innerHTML = `${calendar.monthNames[calendar.date.m]} ${calendar.date.d}, ${calendar.date.y}`;
        });
        [].forEach.call(timeElements, timeElement=>{
            timeElement.innerHTML = `${calendar.date.h}:${calendar.date.i < 10 ? '0' + calendar.date.i : calendar.date.i}`;
        });
    }
    static incarnateDate(){
        var calendar = game.settings.get("incarnateWorldBuilding","incCalendar");
        calendar = calendar.date;
        return calendar.y + "_" + calendar.m + "_"+calendar.d+"_"+calendar.h+"_"+calendar.i+"_"+calendar.s;
    }
    static getYear(date){
        const parts = date.split("_");
        return Number(parts[0]);
    }
    static getMonth(date){
        const parts = date.split("_");
        return Number(parts[0])*12 + Number(parts[1]);
    }
    static getDay(date){
        const parts = date.split("_");
        return Number(parts[0])*12*30 + Number(parts[1])*30 + Number(parts[2]);
    }
    static getHour(date){
        const parts = date.split("_");
        return Number(parts[0])*12*30*24 + Number(parts[1])*30*24 + Number(parts[2])*24 + Number(parts[3]);
    }
    static getMinute(date){
        const parts = date.split("_");
        return Number(parts[0])*12*30*24*60 + Number(parts[1])*30*24*60 + Number(parts[2])*24*60 + Number(parts[3])*60 + Number(parts[4]);
    }
    static getSecond(date){
        const parts = date.split("_");
        return Number(parts[0])*12*30*24*60*60 + Number(parts[1])*30*24*60*60 + Number(parts[2])*24*60*60 + Number(parts[3])*60*60 + Number(parts[4])*60 + Number(parts[5]);
    }
    static toDateString(date){
        const parts = date.split("_");
        const year = Number(parts[0])<10 ? "000" + parts[0]:
            Number(parts[0])<100 ? "00" + parts[0]:
                Number(parts[0])<1000 ? "0" + parts[0]: parts[0];
        const month = game.settings.get("incarnateWorldBuilding","incCalendar").monthNames[Number(parts[1])-1];
        const day = Number(parts[2])<10 ? "0"+parts[2] : parts[2];
        console.log(year,month,day);
        return month.substr(0,3) + " " + day + " " + year;
    }
}
