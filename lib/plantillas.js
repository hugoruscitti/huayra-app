"use strict";
var fs = require('fs.extra');
var path = require('path');
var replaceStream = require('replacestream');

function modulo() {

  function _copyFileSync(source, target, nombre) {

    var targetFile = target;

    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    fs.createReadStream(source).
      pipe(replaceStream('TXT_NOMBRE', nombre)).
      pipe(fs.createWriteStream(targetFile));
  }

  function copyFolderRecursiveSync(source, target, nombre) {
    var files = [];

    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder);
    }

    if (fs.lstatSync(source).isDirectory()) {
      files = fs.readdirSync(source);
      files.forEach(function (file) {
        var curSource = path.join(source, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          copyFolderRecursiveSync(curSource, targetFolder, nombre);
        } else {
          _copyFileSync(curSource, targetFolder, nombre);
        }
      });
    }
  }

  function crearDirectorio(ruta) {
    if (!fs.existsSync(ruta)) {
      fs.mkdirSync(ruta);
    }
  }

  function instanciarPlantilla(nombre_de_plantilla, nombre, destino, on_done) {
    var ruta_a_plantilla = path.join('data', 'plantillas', nombre_de_plantilla);
    var nombre_temporal = "__" + nombre
    var ruta_destino = path.join(destino, nombre_temporal);
    var ruta_destino_final = path.join(destino, nombre);

    crearDirectorio(ruta_destino);
    copyFolderRecursiveSync(ruta_a_plantilla, ruta_destino, nombre);

    fs.move(path.join(ruta_destino, nombre_de_plantilla), ruta_destino_final, function (err) {
      if (err) {
        throw err;
      }

      fs.rmrfSync(ruta_destino);
      console.log("Creando el directorio: " + ruta_destino_final);

      if (on_done)
        on_done.call(this);

    });


  }


  return {
    crearDirectorio: crearDirectorio,
    instanciarPlantilla: instanciarPlantilla
  };
}


var Modulo = modulo();

module.exports = Modulo;