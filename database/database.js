const fs = require('fs');

var firstTime = !fs.existsSync(__dirname + '/recetas.json');

var Datastore = require('nedb'),
    db = {};
db.recetas = new Datastore({ filename: './database/recetas.json' });
db.pedidos = new Datastore({ filename: './database/pedidos.json' });
db.inventarios = new Datastore({ filename: './database/inventarios.json' });
db.productos = new Datastore({ filename: './database/productos.json' });
db.menus = new Datastore({ filename: './database/menus.json' });
db.recetasCategorias = new Datastore({ filename: './database/recetasCategorias.json' });


var models = require('../models');


if (firstTime) {
    db.recetas.ensureIndex({ fieldName: 'nombre', unique: true })
    db.pedidos.ensureIndex({ fieldName: 'nombre', unique: true })
    db.inventarios.ensureIndex({ fieldName: 'nombre', unique: true })
    db.productos.ensureIndex({ fieldName: 'nombre', unique: true })
    db.menus.ensureIndex({ fieldName: 'nombre', unique: true })
    db.recetasCategorias.ensureIndex({ fieldName: 'nombre', unique: true })

    const { defaulCategories } = require('../assets/js/helpers');
    console.log(defaulCategories);

    db.recetasCategorias.insert(defaulCategories, function (err, docs) {
        if (err) { console.log(err); }
        else {
            console.log(docs);
        }
    })

    for (let i = 0; i < 10; i++) {

        let cats = ['pWR8r2psQBewoh3o', 'RiReqMU025L1Ysha', '9Vt97jKaNUWiqoRG'];

        let doc = models.receta('name' + i, '', cats, 'elaboration' + i, 'ingredients' + i, '');

        db.recetas.insert(doc, function (err, newDoc) {
            if (err) { console.log(err); }
            else {
                //console.log(newDoc);
            }

        });
    }
}

module.exports = db;





