let colors = require('colors')
let util = require('util')
let morgan = require('morgan');

//Set up colours for logging
colors.setTheme({
    error: 'red',
    warn: 'yellow',
    debug: 'magenta',
    info: 'gray',
    response: 'black',
    request: 'black',
    system: 'white',
    progress: 'cyan',
    output: "magenta",

    bgError: 'bgBlack',
    bgWarn: 'bgBlack',
    bgDebug: 'bgBlack',
    bgInfo: 'bgBlack',
    bgResponse: 'bgWhite',
    bgRequest: 'bgWhite',
    bgSystem: 'bgMagenta',
    bgProgress: 'bgBlack',
});

FILTERS = [

]

module.exports = (environment, app) => {

    let NODE_ENV = environment ? environment : "development";

    if(NODE_ENV !== "production"){
        //app.use(morgan('dev'));
    }

    let getLogger = (type) => {
        switch(type) {
            case "error":
                return colors.error;
            case "warn":
                return colors.warn;
            case "debug":
                return colors.debug;
            case "info":
                return colors.info;
            case "response":
                return colors.response;
            case "request":
                return colors.request;
            case "system":
                return colors.system;
            case "progress":
                return colors.progress;
            default:
                return colors.info
        }
    }

    let getLoggingBackground = (type) => {
        switch(type) {
            case "error":
                return colors.bgError;
            case "warn":
                return colors.bgWarn;
            case "debug":
                return colors.bgDebug;
            case "info":
                return colors.bgInfo;
            case "response":
                return colors.bgResponse;
            case "request":
                return colors.bgRequest;
            case "system":
                return colors.bgSystem;
            case "progress":
                return colors.bgProgress;
            default:
                return colors.bgInfo
        }
    }

    let getLoggingPrefix = (type) => {
        return "[" + type.toUpperCase() + "]: "
    }

    let deconstruct = (object) => {
        let filtered = filterObject(object);
        let stringified = JSON.stringify(filtered, undefined, 4);
        let highlighted = syntaxHighlight(stringified);
        let outputHighlighted = "[OUTPUT] ".output + highlighted.replace(/[\n\r]/g, "\n[OUTPUT] ".output)
       
        return outputHighlighted;
    }

    let filterObject = (object) => {

        //If it's not a mongo document, don't filter
        if(Object.keys(object).indexOf("_doc") === -1){
            return object;
        }

        //Filter mongo docs
        let copy = Object.assign({}, object._doc);
        let keys = Object.keys(copy);
        let values = Object.values(copy);
        let keysToDelete = [];

        for(let i = 0; i < keys.length; i++) {
            if(FILTERS.indexOf(keys[i]) !== -1 && values[i] !== null && values[i] !== "undefined"){
                keysToDelete.push(keys[i]);
            }
        }

        for(let j = 0; j < keysToDelete.length; j++){
            copy[keysToDelete[j]] = "-- Redacted --";
        }

        return copy;
    }

    let syntaxHighlight = (json) => {
        
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 4);
        }

        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }

            switch(cls) {
                case 'number':
                    return match.progress
                case 'key':
                    return match.warn
                case 'string':
                    return match.green
                case 'boolean':
                    return match.progress
                case 'null':
                    return match.progress
            }
        });
    }

    return {
        log: (type, message) => {
            console.log(getLogger(type)(getLoggingBackground(type)(getLoggingPrefix(type) + message)))
        },

        output: (object) => {
            //console.log(util.inspect(myObject, false, null))
            console.log(getLogger("debug")(getLoggingBackground("debug")("[OUTPUT] ")) + ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>".info)
            console.log(getLogger("info")(deconstruct(object)));
            console.log(getLogger("debug")(getLoggingBackground("debug")("[OUTPUT] ")) + "----------------------------------------------------------".info)
        }
    }
}