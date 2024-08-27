const SavePassword = 'tutorials-raspberrypi.de';
var express = require('express');
var mariadb = require('mariadb');
var app = express();
var bodyParser = require('body-parser');

// Erstelle einen Verbindungs-Pool zu MariaDB
var pool = mariadb.createPool({
    host: '127.0.0.1',
    user: 'root',        // Ersetze durch deinen MariaDB-Benutzernamen
    password: 'your-password',    // Ersetze durch dein MariaDB-Passwort
    database: 'weather_station', // Ersetze durch den Namen deiner Datenbank
    connectionLimit: 5  // Optional: Setze die Anzahl gleichzeitiger Verbindungen
});

app.set('port', (process.env.PORT || 8000));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/views'));
app.use('/scripts', express.static(__dirname + '/node_modules/vis/dist/'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 8000))
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/views'));
app.use('/scripts', express.static(__dirname + '/node_modules/vis/dist/'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// Visualize
app.get('/', function(req, res) {
    
    
    
    // get data from database
    connection.query('SELECT datum x, humidity y, sender_id, \'humidity\' `group` FROM temperature ' + 
                     'UNION SELECT datum x, temp y, sender_id, \'temp\' `group` FROM temperature', function (error, results, fields) {
        if (error) throw error;
        results = JSON.stringify(results);
        
        res.render('index', { data: results });
    });

})

// Send data
app.post('/esp8266_trigger', function(req, res){
    
    var sender_id, temperature, humidity;
    
    if (!req.body.hasOwnProperty("password") || req.body.password != SavePassword) {
        res.json({"code" : 403, "error": "Password incorrect / missing"});
        return;
    }
    
    if (!req.body.hasOwnProperty("sender_id") || req.body.sender_id == "") {
        res.json({"code" : 403, "error": "Sender ID missing"});
        return;
    } else {
        sender_id = req.body.sender_id;
    }
    
    if (!req.body.hasOwnProperty("temperature") || parseFloat(req.body.temperature) == NaN) {
        res.json({"code" : 403, "error": "Temperature Value missing"});
        return;
    } else {
        temperature = parseFloat(req.body.temperature);
    }
    
    if (!req.body.hasOwnProperty("humidity") || parseFloat(req.body.humidity) == NaN) {
        res.json({"code" : 403, "error": "Humidity Value missing"});
        return;
    } else {
        humidtiy = parseFloat(req.body.humidity);
    }
 
    // save
    var query = connection.query('INSERT INTO temperature VALUES ' +
                                ' (DEFAULT, '+mariadb.escape(sender_id)+', NOW(), '+temperature+', '+humidtiy+');', function (error, results, fields) {
        if (error) {
            res.json({"code" : 403, "status" : "Error in connection database"});
            return;
        }
        res.json({"code": 200});
    });
    
    
});

app.listen(app.get('port'));
