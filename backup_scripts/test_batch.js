import translate from 'translate-google';

const obj = {
  a: 'apple',
  b: 'banana',
  c: 'cherry'
};

translate(obj, {to: 'hi'}).then(res => {
    console.log(res);
}).catch(err => {
    console.error(err);
});
