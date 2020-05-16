import express = require('express');// Create a new express app instance
const app: express.Application = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


let pista: Number[][] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

let activo = true;
let xj = 2, yj = 7, contador = 0, temp = 4;
pista[yj][xj] = 1;

//______________________________________________________logica de la matriz________________________________________________________________
//enemigos 2,3,4
//jugador 1
//vacio 0

function newEnemigo() {
    let r = Number(Math.floor(Math.random() * 4));
    let e = Number(Math.floor(Math.random() * 3) + 2);
    pista[0][r] = e;

}

function colision() {
    console.log('colision!!');
    pista = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    activo = false;
}



function actualizarM() {
    if (activo) {
        if (contador == temp) {
            newEnemigo();
            contador = 0;
        }

        for (let i = 0; i < pista.length; i++) {
            for (let j = 0; j < pista[0].length; j++) {
                if (pista[i][j] != 0 && pista[i][j] != 1) {
                    let enemyType = pista[i][j];
                    if (i == pista.length - 1) {
                        pista[i][j] = 0;
                    } else {
                        if (pista[i + 1][j] == 1) {
                            colision();
                        } else {
                            pista[i + 1][j] = enemyType;
                            pista[i][j] = 0;
                            i++;
                        }
                    }
                }
            }
        }

        pista.forEach(fila => {
            console.log(fila);
        });
        console.log('------------------------');
        //enviar matriz a front end :v
        contador++;
    }
}

function izquierda() {
    if (xj == 0) {
        colision();
    } else if (pista[yj][xj - 1] != 0) {
        colision();
    } else {
        pista[yj][xj] = 0;
        xj--;
        pista[yj][xj] = 1;
    }
}
function derecha() {
    if (xj == pista[0].length - 1) {
        colision();
    } else if (pista[yj][xj + 1] != 0) {
        colision();
    } else {
        pista[yj][xj] = 0;
        xj++;
        pista[yj][xj] = 1;
    }
}
function up() {
    if (yj == 0) {
        colision();
    } else if (pista[yj - 1][xj] != 0) {
        colision();
    } else {
        pista[yj][xj] = 0;
        yj--;
        pista[yj][xj] = 1;
    }
}

function down() {
    if (yj == pista.length - 1) {
        colision();
    } else if (pista[yj + 1][xj] != 0) {
        colision();
    } else {
        pista[yj][xj] = 0;
        yj++;
        pista[yj][xj] = 1;
    }
}

function moverse(d: Number) {
    if (activo) {
        switch (d) {
            case 0:
                izquierda();
                break;
            case 1:
                derecha();
                break;
            case 2:
                up();
                break;
            case 3:
                down();
                break;
        }
    }
}


//-----------------------------------------------------------------------LOOP----------------------------------------------------------

let timeIntevalSeconds = 3;

setInterval(() => { actualizarM() }, timeIntevalSeconds * 1000);







//_____________________________________server endpoints_________________________________________________________


app.get('/', function (req, res) {
    res.send('funciona!  ( -w-)/');
});



app.post('/moverse', (req: any, res: any) => {
    //console.log(req.body);
    moverse(Number(req.body.direccion));

    res.send("ok");
});




app.listen(3000, function () {
    console.log('App is listening on port 3000!');
});
