const database = {
    tables: {},
    createTable: function (command) {
        const regExp = /create table ([a-z]+) \((.+)\)/;
        const regExpResult = regExp.exec(command);
        const tableName = regExpResult[1];
        const commandColumns = regExpResult[2];
        const columns = commandColumns.split(', ');
        this.tables = {
            [tableName]: {
                columns: {}
            },
            data: []
        };

        for (const column of columns) {
            const item = column.split(" ");
            const col = item[0];
            const tipo = item[1];
            this.tables[tableName].columns[col] = tipo;
        }
        return this;
    },
    execute: function (command) {
        if (command.startsWith('create table')) {
            return this.createTable(command);
        }
    }
}
console.log(JSON.stringify(database.execute("create table author (id number, name string, age number, city string, state string, country string)")));