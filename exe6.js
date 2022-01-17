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
                columns: {},
                data: []
            }
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
        if (command.startsWith('insert into')) {
            return this.insert(command);
        }
        if (command.startsWith('select')) {
            return this.select(command);
        }
        throw new DatabaseError(command, `Syntax error: '${command}'`);
    },
    insert(command) {
        const commandMatch = command.match(/insert into ([a-z]+) \((.+)\) values \((.+)\)/);
        const tableName = commandMatch[1];
        const columns = commandMatch[2].split(', ');
        const values = commandMatch[3].split(', ');
        let row = {};
        for (let i = 0; i < values.length; i++) {
            const column = columns[i];
            const value = values[i];
            row[column] = value;
        }

        this.tables[tableName].data.push(row);
    },
    select(command) {
        const commandMatch = command.match(/select (.+) from ([a-z]+)(?: where (.+))?/);
        const columns = commandMatch[1].split(", ");
        const tableName = commandMatch[2];

        let rows = this.tables[tableName].data;

        const whereClause = commandMatch[3] || null;
        if (whereClause !== null) {
            const whereCondition = whereClause.split(" ");
            const [columnWhere, condition, valueWhere] = whereCondition;
            rows = rows.filter(function (row) {
                return (row[columnWhere] === valueWhere);
            })
        }
        rows = rows.map(function (row) {
            let selectedRows = {};
            columns.forEach(function (column) {
                selectedRows[column] = row[column];
            })
            return selectedRows;
        });
        console.log(rows);

    }
};
try {
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    database.execute("select name, age from author");
    database.execute("select id, name, age from author where id = 1");
    console.log(JSON.stringify(database, undefined, "  "));
} catch (e) {
    console.log(e.message);
}