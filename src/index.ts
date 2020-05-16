import express = require('express');// Create a new express app instance
const app: express.Application = express();
import cors from 'cors';
import * as socketio from "socket.io";
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());



//------------------------------------------------------------------------------------SOCKET--------------------------------------------------


let http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
let io = require("socket.io")(http, {
    handlePreflightRequest: (req: any, res: any) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});



io.on('connection', function (socket: any) {
    console.log('user connected');

    socket.on('nuevoJuego', function (message: any) {
        newJuego();
    });
});



//---------------------------------------------------------------------------------------------------------------------------------------------------------------------

let pista: Number[][] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
let punteo = 0;
let tiempo = 0;
let activo = false;
let xj = 2, yj = 7, contador = 0, temp = 4;
pista[yj][xj] = 1;

//______________________________________________________logica de la matriz________________________________________________________________
//enemigos 2,3,4
//jugador 1
//vacio 0

function sumarPunteo(e: Number) {
    switch (e) {
        case 2:
            punteo += 2;
            break;
        case 3:
            punteo += 3;
            break;
        case 4:
            punteo += 5;
            break;
    }
}

function newEnemigo() {
    let r = Number(Math.floor(Math.random() * 4));
    let notRandomNumbers = [2, 2, 3, 2, 2, 3, 2, 3, 4, 4];
    let e = Math.floor(Math.random() * notRandomNumbers.length);
    pista[0][r] = notRandomNumbers[e];

}

function colision() {
    console.log('colision!!');
    pista = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    activo = false;
}

function newJuego() {
    activo = true;
    xj = 2;
    yj = 7;
    contador = 0;
    temp = 4;
    pista = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    pista[yj][xj] = 1;
    tiempo = 0;
    punteo = 0;
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
                        sumarPunteo(Number(enemyType));
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
        console.log('-------T:' + tiempo + '-----------------P:' + punteo);
        io.sockets.emit('matriz', { matriz: pista, punteo: punteo, tiempo: tiempo, activo: activo });
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
            case 2:
                izquierda();
                break;
            case 1:
                derecha();
                break;
            case 3:
                up();
                break;
            case 4:
                down();
                break;
        }
        io.sockets.emit('matriz', { matriz: pista, punteo: punteo, tiempo: tiempo, activo: activo });
    }
}
//matriz, punteo, tiempo, activo

//-----------------------------------------------------------------------LOOP----------------------------------------------------------

let timeIntevalSeconds = 1;

setInterval(() => { actualizarM(); tiempo++; }, timeIntevalSeconds * 1000);







//_____________________________________server endpoints_________________________________________________________


app.get('/', function (req, res) {
    res.send('funciona!  ( -w-)/');
});



app.post('/moverse', (req: any, res: any) => {
    //console.log(req.body);
    moverse(Number(req.body.direccion));

    res.send("ok");
});

app.post('/reiniciar', (req: any, res: any) => {
    //console.log(req.body);
    newJuego();

    res.send("ok");
});



app.listen(8080, function () {
    console.log('App is listening on port 8080!');
});
