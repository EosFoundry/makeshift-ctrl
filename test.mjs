const actions = {
  "key1": "It is key1",
  "key2": "It is key2",
  "key3": "It is key3",
  "key4": "It is key4",
  "key5": "It is key5",
  "key6": "It is key6",
  "key7": "It is key7",
  "key8": "It is key8",
};
const keys = [
  "key1", "key2", "key3", "key4", "key5", "key6", "key7", "key8"
];
const getRandomKey = () => keys[Math.floor(Math.random() * keys.length)];;

const startMap = process.hrtime.bigint();
for (let i = 0; i < 1000000; i++) {
  let result = actions[getRandomKey()];
}
const endMap = process.hrtime.bigint();
console.log("Map Lookup:", Number(endMap - startMap) / 1000000, "ms");

const startIf = process.hrtime.bigint();
for (let i = 0; i < 1000000; i++) {
  let result;
  const randomKey = getRandomKey();
  if (randomKey === "key1") {
    result = "It is key1";
  } else if (randomKey === "key2") {
    result = "It is key2";
  } else if (randomKey === "key3") {
    result = "It is key3";
  } else if (randomKey === "key4") {
    result = "It is key4";
  } else if (randomKey === "key5") {
    result = "It is key5";
  } else if (randomKey === "key6") {
    result = "It is key6";
  } else if (randomKey === "key7") {
    result = "It is key7";
  } else if (randomKey === "key8") {
    result = "It is key8";
  }
}
const endIf = process.hrtime.bigint();
console.log("If Statement:", Number(endIf - startIf) / 1000000, "ms");
