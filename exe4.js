const DatabaseError = function (statement, message) {
    this.statement = statement;
    this.message = message;
};

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
        throw new DatabaseError(command, `Syntax error: '${command}'`);
    }
};
try {
    console.log(JSON.stringify(database.execute("select id, name from author")));
} catch (e) {
    console.log(e.message);
}