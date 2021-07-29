import * as fs from "fs";
const languageEN = loadLanguage("EN");
const languageCH = loadLanguage("CH");

export function changeLanguage(session: any, language: string): boolean {
  if (typeof session != "object" || session == null) return false;
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

export function translate(entry: string, language: string): string {
  if (language == "EN") return entry in languageEN ? languageEN[entry] : entry;
  if (language == "CH") return entry in languageCH ? languageCH[entry] : entry;
  return entry;
}

function loadLanguage(language: string) {
  try {
    let rawData = fs.readFileSync(`translations/${language}.lang`, { encoding: "utf-8" });
    let parsedData = JSON.parse(rawData);
    return parsedData;
  } catch (err) {
    console.error(err);
    return {};
  }
}
