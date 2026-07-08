import translate from 'translate-google';
const toTranslate = [
  { id: 1, questionTranslated: "hi", optionsTranslated: ["a", "b"], explanationTranslated: "" }
];
console.log("Translating:", toTranslate);
translate(toTranslate, { to: "hi" }).then(res => console.log("Res:", res)).catch(err => console.error(err));
