function getPropertyOutputDirectoryName(inputDirName) {
    let ret = [];
    if (inputDirName && inputDirName !== "") {
      let reversedArr = inputDirName.trim().split("").reverse();
      let num;
      for (var i = 0; i < reversedArr.length; ++i) {
        if (reversedArr[i] !== "-") {
          num = Number(reversedArr[i]);
          ret.push(9 - num);
        } else {
          ret.push(reversedArr[i]);
        }
      }
    }
    return ret.join("");
  }
  
  module.exports = { getPropertyOutputDirectoryName };
  