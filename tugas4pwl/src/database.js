const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'movieAction'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database.');

  const dummyData = [
    [1, 'Mad Max: Fury Road', 2015],
    [2, 'John Wick', 2014],
    [3, 'Deadpool', 2018],
    [4, 'Logan', 2017],
    [5, 'Black Panther', 2018],
    [6, 'Mission: Impossible - Fallout', 2018],
    [7, 'Spider-Man: Into the Spider-Verse', 2018],
    [8, 'Avengers: Infinity War', 2018],
    [9, 'Avengers: Endgame', 2019],
    [10, 'Wonder Woman 1984', 2020]
  ];

  const sql = 'INSERT INTO actions (id, title, year) VALUES ?';

  connection.query(sql, [dummyData], (err, result) => {
    if (err) throw err;
    console.log(`Inserted ${result.affectedRows} records.`);
  });

  connection.end();
});
