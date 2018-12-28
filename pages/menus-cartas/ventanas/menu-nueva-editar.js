
const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
const { dialog } = remote;
const { closeWindow, minimizeWindow, maxsimizeWindow } = remote.require('./main.js');
const db = require('../../../database/database');
const swal = require('sweetalert');

const editName = $('#me-edit-nombre'),
    editEntrantes = $('#me-edit-entr'),
    editPrimeros = $('#me-edit-prim'),
    editSegundos = $('#me-edit-seg'),
    editPostres = $('#me-edit-post'),
    editComments = $('#me-edit-comm');


const loadSelectRecipes = () => {

    db.recetas.loadDatabase((err)=>{if(err) console.log(err);
    });

    db.recetasCategorias.loadDatabase((err)=>{if(err) console.log(err);
    });

    db.recetasCategorias.find({},(err,cats)=>{
        $('select').html('');

        if(err) console.log(err);

        if(cats){
            let items="";
            cats.forEach((cat)=>{
                items += `<optgroup  label="${cat.nombre}">`
                db.recetas.find({"cats.nombre":cat.nombre}, (err, recipes) => {
                    recipes.forEach((recipe)=>{
                        $('select').find(`optgroup[label='${cat.nombre}']`).append(`<option value="${recipe._id}">${recipe.nombre}</option>`)
                        
                    })
                })
                items += '</optgroup>'
            })

            
            setTimeout(()=>{
                $('select').html(items);
                
                $('select').chosen({
                    placeholder_text_multiple: 'Selecciona platos'
                });
            },500)
            

        }else{
            db.recetas.find({}, (err, docs) => {
                if (err) console.log(err)
                if (docs) {
                    console.log(docs);
        
                    let items = "";
        
                    $('select').html('');
        
                    docs.forEach((recipe) => {
                        items += `<option value="${recipe._id}">${recipe.nombre}</option>`
                    })
        
                    $('select').html(items);

                    $('select').chosen({
                        placeholder_text_multiple: 'Selecciona platos'
                    });
                            
                }
        
        
            })
        }
        
    })

    /* db.recetas.find({}, (err, docs) => {
        if (err) console.log(err)
        if (docs) {
            console.log(docs);

            let items = "";

            $('select').html('');

            docs.forEach((recipe) => {
                items += `<option value="${recipe._id}">${recipe.nombre}</option>`
            })

            $('select').html(items);

            $('select').chosen({
                placeholder_text_multiple: 'Selecciona platos'
            });
        }


    }) */

}


const loadRecipes = (recipes, elem) => {
    elem.html('');

    recipes.forEach(recipe => elem.append(`<option value="${recipe._id}">${recipe.nombre}</option>`));

    elem.chosen({
        placeholder_text_multiple: 'Selecciona platos'
    });

}

ipcRenderer.on('data-edit', function (event, menu) {

    if (menu._id != 0) {

    }
});



$('#close').on('click', () => { closeWindow(2) });

$('#min').on('click', () => { minimizeWindow(2) });

$('#max').on('click', () => { maxsimizeWindow(2) });

loadSelectRecipes();