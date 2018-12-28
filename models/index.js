models = {

    receta: (name, img, cats, elaboracion, ingredientes, url) => {

        return {
            nombre: name,
            img: img,
            cats: cats,
            elaboracion: elaboracion,
            ingredientes: ingredientes,
            url: url
        }

    },
    menus_cartas: (name, entrantes, primeros, segundos, postres, otros, comentarios, fecha, type) => {

        return {
            nombre: name,
            entrantes, entrantes,
            primeros: primeros,
            segundos: segundos,
            postres: postres,
            otros: otros,
            comentarios: comentarios,
            fecha: fecha,
            tipo:type
        }
    }
}

module.exports = models;

