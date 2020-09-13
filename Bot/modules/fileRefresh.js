// // Automatické reloadování příkazů když se změní jejich soubor

// const fs = require('fs');
// const md5 = require('md5');

// const buttonPressesLogFile = './button-presses.log';

// console.log(`AUTOREFRESH ZAPNUT`);

// const init = async () => {

//     const cmdFiles = await readdir("./commands/");
//     cmdFiles.forEach(f => {
//         if (!f.endsWith(".js")) return;

//         let md5Previous = null;
//         let fsWait = false;
//         fs.watch(buttonPressesLogFile, (event, filename) => {
//             if (filename) {
//                 if (fsWait) return;
//                 fsWait = setTimeout(() => {
//                     fsWait = false;
//                 }, 100);
//                 const md5Current = md5(fs.readFileSync(buttonPressesLogFile));
//                 if (md5Current === md5Previous) {
//                     return;
//                 }
//                 md5Previous = md5Current;
//                 console.log(`${filename} soubor změněn`);
//             }
//         });
//     })

// }

// init();


