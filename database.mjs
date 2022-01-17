import { Parser } from "./parser.mjs";
import { DatabaseError } from "./databaseError.mjs";

export class Database {
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
    execute(statement) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const result = this.parser.parse(statement);
                if (result) {
                    resolve(this[result.command](result.parsedStatement));
                }
                reject(new DatabaseError(statement, `Syntax error: '${statement}'`));
            }, 1000);
        })
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