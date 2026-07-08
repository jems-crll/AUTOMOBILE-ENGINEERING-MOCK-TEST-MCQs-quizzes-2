import translate from 'translate-google';

const arr = [
  { question: "What is an apple?", options: ["Fruit", "Car"] },
  { question: "What is a dog?", options: ["Animal", "Plant"] }
];

translate(arr, {to: 'hi'}).then(res => {
    console.log(JSON.stringify(res, null, 2));
}).catch(err => {
    console.error(err);
});
