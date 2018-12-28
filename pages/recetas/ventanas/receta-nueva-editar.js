const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
const { dialog } = remote;
const { closeWindow, minimizeWindow, maxsimizeWindow } = remote.require('./main.js');
const db = require('../../../database/database');
const swal = require('sweetalert');

const titlePage = $('.navbar-brand'),
    formRecipe = $('#edit-recipe'),
    formSubmitButton = $('#edit-recipe input[type="submit"]'),
    editID = $('#re-id'),
    editNombre = $('#re-edit-nombre'),
    editImg = $('#re-edit-img'),
    editCats = $('#re-edit-cats'),
    editIngredientes = $('#re-edit-ingredientes'),
    editElaboracion = $('#re-edit-elaboracion'),
    editUrl = $('#re-edit-url'),
    recipeImageButton = $('#recipe-image');


const loadCategories = (cats) => {
    editCats.html('');

    cats.forEach(cat => editCats.append(`<option value="${cat._id}">${cat.nombre}</option>`));

    editCats.chosen({
        placeholder_text_multiple: 'Selecciona categorias'
    });

}

ipcRenderer.on('data-edit', function (event, recipe) {

    db.recetasCategorias.find({}, (err, docs) => {
        if (err) { console.log(err) }
        if (docs) {
            loadCategories(docs);
        }
    });

    if (recipe.id != 0) {

        db.recetas.findOne({ _id: recipe.id }, (err, doc) => {
            if (err) { console.log(err) }
            if (doc) {

                recipe = doc;
                console.log('recipe', recipe);
                editID.val(doc._id);
                titlePage.text(`Editar ${doc.nombre}`);
                editNombre.val(doc.nombre);
                editImg.attr('src', doc.img.length > 0 ? doc.img : '../../../assets/img/recipe-big-placeholder.jpg');
                editIngredientes.val(doc.ingredientes);
                editElaboracion.val(doc.elaboracion);
                editUrl.val(doc.url);

                if (doc.cats) {
                    let cats = doc.cats.map((cat) => cat._id)

                    setTimeout(() => {
                        editCats.chosen('destroy').val(cats).chosen();;

                    }, 500)
                }

            }

            formSubmitButton.val(doc ? 'Actualizar' : 'Guardar');

        })
    }
});

recipeImageButton.on('click', (e) => {
    e.preventDefault();
    const dialogOptions = { buttons: ['Ok', 'Cancel'], title: 'Imagen de la receta', message: 'Selecciona la imagen para tu receta', filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }] }
    dialog.showOpenDialog(dialogOptions, (files) => {

        editImg.attr('src', files[0])
    });
})

formRecipe.submit((e) => {

    e.preventDefault();

    if (!editNombre.val()) {
        swal('Error', 'Es necesario un nombre de receta', 'error');
        return;
    }

    let cats = editCats.val();

    if (Object.keys(cats).length) {

        db.recetasCategorias.find({ _id: { $in: cats } }, (err, docs) => {
            cats = docs;

        })
    }

    let models = require('../../../models');

    let img = editImg.attr('src').indexOf('placeholder') === -1 ? editImg.attr('src') : '';

    setTimeout(() => {

        let doc = models.receta(editNombre.val(), img, cats, editIngredientes.val(), editElaboracion.val(), editUrl.val());

        if (editID.val()) {

            db.recetas.update({ _id: editID.val() }, doc, (err, numReplaced) => {
                if (err) {
                    swal("Error", "Ocurrio un error al actualizar : " + err, "err");
                }
                if (numReplaced > 0) {

                    swal("Ok", "receta actualizada", "success").then((val)=>{
                      
                        ipcRenderer.send('add-or-updated', []);
                    });;
                    
                }

            });

        } else {

            db.recetas.insert(doc, (err, doc) => {
                if (err) {
                    swal("Error", "Ocurrio un error : " + err, "err");
                }
                if (doc) {
                    swal("Ok", "Receta guaradad con exito!", "success").then((val)=>{
                       
                        ipcRenderer.send('add-or-updated', []);
                    });
                    
                }
            });

        }
        
    }, 500)

});

$('#close').on('click', () => { closeWindow(2) });

$('#min').on('click', () => { minimizeWindow(2) });

$('#max').on('click', () => { maxsimizeWindow(2) });



