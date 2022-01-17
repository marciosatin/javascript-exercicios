let command = "create table author (id number, name string, age number, city string, state string, country string)";
const regExp = /create table ([a-z]+) \((.+)\)/;
const regExpResult = regExp.exec(command);
// console.log(regExpResult);

const tableName = regExpResult[1];
let commandColumns = regExpResult[2];
// console.log(tableName);
// console.log(commandColumns);

let columns = commandColumns.split(', ');
// console.log(columns);

let tables = {};
tables[tableName] = {"columns": {}};

for (const column of columns) {
    let item = column.split(" ");
    tables[tableName]["columns"][item[0]] = item[1];
}
tables[tableName]["data"] = [];
let database = {"tables": tables};

console.log(JSON.stringify(database, null, "  "));