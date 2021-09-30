"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = exports.changeLanguage = void 0;
var fs = require("fs");
var languageEN = loadLanguage("EN");
var languageCH = loadLanguage("CH");
function changeLanguage(session, language) {
    if (typeof session != "object" || session == null)
        return false;
    switch (language) {
        case "EN":
            session.language = "EN";
            break;
        case "CH":
            session.language = "CH";
            break;
        default:
            return false;
    }
    return true;
}
exports.changeLanguage = changeLanguage;
function translate(entry, language, substitutions) {
    if (substitutions === void 0) { substitutions = []; }
    var ret;
    if (language == "EN")
        ret = entry in languageEN ? languageEN[entry] : entry;
    if (language == "CH")
        ret = entry in languageCH ? languageCH[entry] : entry;
    for (var i = 0; i < substitutions.length; i++)
        ret = ret.replace("$(" + i + ")", substitutions[i]);
    return ret;
}
exports.translate = translate;
function loadLanguage(language) {
    try {
        var rawData = fs.readFileSync("translations/" + language + ".lang", { encoding: "utf-8" });
        var parsedData = JSON.parse(rawData);
        return parsedData;
    }
    catch (err) {
        console.error(err);
        return {};
    }
}
