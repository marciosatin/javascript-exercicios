let command = 'create table author (id number, name string, age number, city string, state string, country string)';
const tableName = command.match(/create table ([a-z]+)/)[0];
console.log(tableName);

let columns = command.match(/\((.+)\)/);
console.log(columns[1].split(', '));
