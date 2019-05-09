// Cargar modulos y crear nueva aplicacion
var express = require("express"); 
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // soporte para bodies codificados en jsonsupport
app.use(bodyParser.urlencoded({ extended: true })); // soporte para bodies codificados


// API REAL:

const modelsFolder = './models/';
var fs = require('fs');



// Obre una pipe de lectura per a llegir del fitxer. No sabem com es crida això
app.get('/:model_obj', function(req, res){
  var filename = req.params.model_obj;
  var readStream = fs.createReadStream('./models/' + filename);
  console.log ("INICIA AQUI LA INFO!!!!!!!!!!!");
  console.log (readStream);
  console.log ("FINALITZA AQUI LA INFO!!!!!!!!");
  res.pipe(readStream);
  }, function(err) {
    throw err;
});


// Retorna el fitxer (creiem) o contingut. A postman sembla que retorni contingut..
app.get('/proves/:model_obj', function(req, res){
  var filename = req.params.model_obj;
  res.download(modelsFolder + filename);
  }, function(err) {
    throw err;
});


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


// Retorna llista amb tots els fitxers que puc escollir com a model dins la carpeta Models
app.get('/models/list', function(req, res){
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


// Retorna el contingut del fitxer nom model_obj
app.get('/contingut/:model_obj', function(req, res){
  var filename = req.params.model_obj;
  readFile(filename, function(filename, content) { 
    res.send(content);
  }, function(err) {
    throw err;
  });
});


var server = app.listen(8090, function () {
    console.log('Server is running..'); 
});