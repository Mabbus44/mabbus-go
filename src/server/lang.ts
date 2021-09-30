import * as fs from "fs";
const languageEN: { [key: string]: string } = loadLanguage("EN");
const languageCH: { [key: string]: string } = loadLanguage("CH");

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

export function translate(entry: string, language: string, substitutions: string[] = []): string {
  let ret: string;
  if (language == "EN") ret = entry in languageEN ? languageEN[entry] : entry;
  if (language == "CH") ret = entry in languageCH ? languageCH[entry] : entry;
  for (let i = 0; i < substitutions.length; i++) ret = ret.replace(`$(${i})`, substitutions[i]);
  return ret;
}

function loadLanguage(language: string): { [key: string]: string } {
  try {
    let rawData: string = fs.readFileSync(`translations/${language}.lang`, { encoding: "utf-8" });
    let parsedData: { [key: string]: string } = JSON.parse(rawData);
    return parsedData;
  } catch (err) {
    console.error(err);
    return {};
  }
}
