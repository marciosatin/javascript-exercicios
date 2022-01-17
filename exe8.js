class Parser {
    constructor() {
        this.commands = new Map();
        this.commands.set("createTable", /create table ([a-z]+) \((.+)\)/);
        this.commands.set("insert", /insert into ([a-z]+) \((.+)\) values \((.+)\)/);
        this.commands.set("select", /select (.+) from ([a-z]+)(?: where (.+))?/);
        this.commands.set("delete", /delete from ([a-z]+)(?: where (.+))?/);
    }

    parse(statement) {
        for (let [command, regexp] of this.commands) {
            const parsedStatement = statement.match(regexp);
            if (parsedStatement) {
                return {
                    command,
                    parsedStatement
                }
            }
        }
    }
};

class DatabaseError {
    constructor(statement, message) {
        this.statement = statement;
        this.message = message;
    }
};

class Database {
    constructor() {
        this.tables = {};
        this.parser = new Parser();
    }
    createTable(parsedStatement) {
        const tableName = parsedStatement[1];
        const commandColumns = parsedStatement[2];
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
    }
    execute(statemente) {
        const result = this.parser.parse(statemente);
        if (result) {
            return this[result.command](result.parsedStatement);
        }
        throw new DatabaseError(statemente, `Syntax error: '${statemente}'`);
    }
    insert(parsedStatement) {
        const tableName = parsedStatement[1];
        const columns = parsedStatement[2].split(', ');
        const values = parsedStatement[3].split(', ');
        let row = {};
        for (let i = 0; i < values.length; i++) {
            const column = columns[i];
            const value = values[i];
            row[column] = value;
        }

        this.tables[tableName].data.push(row);
    }
    select(parsedStatement) {
        const columns = parsedStatement[1].split(", ");
        const tableName = parsedStatement[2];

        let rows = this.tables[tableName].data;

        const whereClause = parsedStatement[3] || null;
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
    delete(parsedStatement) {
        let [, tableName, whereClause] = parsedStatement;
        let rows = [];
        if (whereClause) {
            whereClause = whereClause.split(" ");
            const [whereColumn, condition, whereValue] = whereClause;
            rows = this.tables[tableName].data;
            rows = rows.filter(function (row) {
                return (row[whereColumn] !== whereValue);
            })
        }
        this.tables[tableName].data = rows;
        console.log(rows);
    }
};
try {
    let database = new Database
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    database.execute("delete from author where id = 2");
    database.execute("select name, age from author");
    // console.log(JSON.stringify(database, undefined, "  "));
} catch (e) {
    console.log(e.message);
}