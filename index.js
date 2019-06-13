// Cargar modulos y crear nueva aplicacion
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const sqlite3 = require('sqlite3').verbose();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // soporte para bodies codificados en jsonsupport
app.use(bodyParser.urlencoded({ extended: true })); // soporte para bodies codificados


let db = new sqlite3.Database('./config.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the config database.');
});

// API REAL:

const modelsFolder = './models/';
var fs = require('fs');


// [GET] LLamada para hacer test en el navegador
app.get('/', function(req,res){
  res.send("Hola")
})


// [GET] Retorna el fitxer (creiem) o contingut. A postman sembla que retorni contingut..
app.get('/proves/:model_obj', function(req, res){
  var filename = req.params.model_obj;
  res.download(modelsFolder + filename);
  }, function(err) {
    throw err;
});


// [GET] Retorna llista amb tots els fitxers que puc escollir com a model dins la carpeta Models
app.get('/list', function(req, res){
  fs.readdir(modelsFolder, (err, files) => {
    var filesList = [];
    files.forEach(file => {
      filesList[filesList.length] = file;
    });
    res.send(filesList);
  }, function(err) {
    throw err;
  });
});


// [GET] Retorna el contingut del fitxer nom model_obj
app.get('/model/:model_obj', function(req, res){
  var filename = req.params.model_obj;
  readFile(filename, function(filename, content) { 
    res.send(content);
  }, function(err) {
    throw err;
  });
});


// [GET] Obre una pipe de lectura per a llegir del fitxer. No sabem com es crida això
app.get('/model/:model_obj', function(req, res){
  var filename = req.params.model_obj;
  var readStream = fs.createReadStream('./models/' + filename);
  console.log ("INICIA AQUI LA INFO!!!!!!!!!!!");
  console.log (readStream);
  console.log ("FINALITZA AQUI LA INFO!!!!!!!!");
  res.pipe(readStream);
  }, function(err) {
    throw err;
});


// [GET] EndPoint para indicar que modelo queremos reproducir a través de Sockets.io
app.get('/change/:model_obj', function(req, res){
  var filename = req.params.model_obj;
  console.log("[GET] /change/"+filename)
  io.emit('change',  filename )
  res.sendStatus(200)
});

// [GET] EndPoint para indicar que modelo queremos reproducir a través de Sockets.io
app.get('/ghost', function(req, res){
  console.log("[GET] /ghost")
  io.emit('ghost')
  res.sendStatus(200)
});

app.get('/ogre', function(req, res){
  console.log("[GET] /ogre")
  io.emit('ogre')
  res.sendStatus(200)
});


// [GET] Retorna el tipus de configuració de la app
app.get('/config/type', function(req, res){
    let sql = `SELECT * FROM variables WHERE name = ?`;
    let name = "type";

    // first row only
    db.get(sql, [name], (err, row) => {
        if (err) {
          console.error(err.message);
        }
        console.log(row.value)
        res.status(200).send({ "value": row.value });

    });
});

// [POST] Posa el tipus de configuració a la app
app.post('/config/type', function(req,res){
  let sql = 'UPDATE variables SET value = ? WHERE name = ?;'
  let value = [req.body.value, "type"]

  db.run(sql, value, function(err) {
    if (err) {
      console.error(err.message);
      res.sendStatus(400)
    }
    res.sendStatus(200)
   
  });
})

/* L' Arnau inventant
app.get('/modulos/:filename', function(req, res){
  var filename = req.params.filename; 
  get('./', filename + ".txt", function(err, res) {
    console.log(filename);
    var file = fs.createWriteStream('./modulos/holamundo.txt');
    console.log(file + "AIXO ES EL FILE");
    res.pipe(file);
  }, function(err) {
    throw err;
  });
}); 
*/


//Inicializamos Sockets
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('coca', function(msg){
    console.log('message: ' + msg);
  });
});


//Funcio auxiliar per a la crida de sota
function readFile(filename, onFileContent, onError) {
  var fileDestination = modelsFolder + filename;
  console.log(fileDestination);
  fs.readFile(fileDestination, 'utf-8', function(err, content) {
    if (err) {
      onError(err);
      return;
    }
    onFileContent(filename, content);
  });
}






const PORT = process.env.PORT || 3000

http.listen( PORT, function(){
  console.log('listening on *:'+ PORT );
});