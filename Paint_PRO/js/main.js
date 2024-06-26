document.addEventListener('DOMContentLoaded',function(){
    const canvas = document.getElementById("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const paper = canvas.getContext("2d");
    const undo = document.getElementById('undo');
    const redo = document.getElementById('redo');
    const move = document.getElementById('move');
    const scale = document.getElementById('ratio');
    const rotate = document.getElementById('rotate');
    const toPNG = document.getElementById('toPNG');
    const toJPG = document.getElementById('toJPG');
    const Colors = document.querySelectorAll('.color');
    const Figrs = document.querySelectorAll('.fig');
    const save = document.getElementById('Save');
    const open = document.getElementById('openfile');
    const restart = document.getElementById('restart');
    const layer = document.querySelectorAll('.post');
    const menu = document.querySelectorAll('.menu-figuras');
    var figure=[];
    var back_store =[];
    var isDrawing = false;
    var isScale = false;
    var isRotate = false;
    var isEraser = false;
    var firstPointX = 0;
    var firstPointY = 0;
    var finalPointX = 0;
    var finalPointY = 0;
    var modo = 'pencil';
    var Color_line = 'black';
    let current_index=null;
    let json =[];
    const picker = document.getElementById('picker');
    Colors.forEach((button)=>{
        button.addEventListener('click',function (ev) {
            Color_line=button.value;
        })
    });
    picker.addEventListener('change',function () {
        Color_line = picker.value;
    })
    layer.forEach((button)=>{
       button.addEventListener('click',function () {
           modo = button.value;
       })
    });
    open.addEventListener('click',function () {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = function (event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                figure = JSON.parse(event.target.result);

                drawFigure();
            };
            reader.readAsText(file);
        };
        input.click();
    })
    menu.forEach((value)=>{
        value.addEventListener('onload',function () {
            for (let fig of figure){
                let h3= document.createElement('h3');
                document.body.appendChild(h3);
                h3.textContent = 'hi';
            }
        });
    })
    Figrs.forEach((button)=>{
       button.addEventListener('click',function (){
           modo=button.value;
       })
    });
    restart.addEventListener('click',function () {
        paper.clearRect(0, 0, canvas.width, canvas.height);
        drawtext(txt, 0, 0);
        figure=[];
        back_store=[];
    })
    save.addEventListener('click',function () {
        json=JSON.stringify(figure);
        console.log(json)
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'figuras.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    let sinsel_size=5;
    //Rango de tamaño
    const  range = document.getElementById('range');
    const dat = document.getElementById('data');
    const eraser = document.getElementById('eraser');
    const eraser_pix = document.getElementById('eraser_pix');
    range.addEventListener('change',function () {
       dat.textContent = range.value;
       sinsel_size=range.value;
    });
    eraser.addEventListener('click',function () {
        modo='eraser';
    })
    eraser_pix.addEventListener('click',function () {
        modo='eraser_pix';
    })
    move.addEventListener('click',function () {
        modo='move';
    });
    scale.addEventListener('click',function (){
       modo='scale';
    });
    rotate.addEventListener('click',function () {
        modo='rotate';
    });
    undo.addEventListener('click',function (){
        if (figure.length>0){
            back_store.push(figure.pop());
            drawFigure();
        }
    })
    toPNG.addEventListener('click',function (){
       const  a = document.createElement('a');
       const dataURI= canvas.toDataURL();
       document.body.appendChild(a);
       a.href = dataURI;
       a.download = "canvas-image.png";
       a.click();
    });
    toJPG.addEventListener('click',function (){
        const  a = document.createElement('a');
        const dataURI= canvas.toDataURL();
        document.body.appendChild(a);
        a.href = dataURI;
        a.download = "canvas-image.jpg";
        a.click();
    });
    const toPDF = document.getElementById('toPDF');
    toPDF.addEventListener('click',function () {
        genPDF();
    })

    function genPDF() {
        var doc = new jsPDF({
            orientation: "landscape",
            unit: 'mm',
            format: [canvas.clientWidth,canvas.clientHeight]
        });
        const dataURI= canvas.toDataURL({
            type:'png',
            quality:1
        });
        doc.addImage(dataURI,"PNG",0,0);
        doc.save("Midocumento.pdf")
    }
    redo.addEventListener('click',function (){
        if (back_store.length>0){
            figure.push(back_store.pop());
            drawFigure();
        }
    })
    // function EllipsePoint(xc,yc,x,y,angle){
    //     paper.fillRect(xc+x,yc+y,5,5);
    //     paper.fillRect(xc-x,yc+y,5,5);
    //     paper.fillRect(xc+x,yc-y,5,5);
    //     paper.fillRect(xc-x,yc-y,5,5);
    // }
    // function DrawEllipse(xc,yc,a,b,angle)
    // {
    //     var dx, dy, d1, d2, x, y;
    //     x = 0;
    //     y = b;
    //     let a_mul =a * a
    //     let b_mul =b * b
    //     // Initial decision parameter of region 1
    //     d1 = Math.round(b_mul - a_mul * b + 0.25 * a_mul);
    //     dx = 2 * b_mul * x;
    //     dy = 2 * a_mul * y;
    //     // For region 1
    //     while (dx < dy)
    //     {
    //         EllipsePoint(xc,yc,x,y,angle);
    //         x++;
    //         dx += 2 * b_mul;
    //         if (d1 < 0)
    //         {
    //             d1 += dx + b_mul;
    //         }
    //         else
    //         {
    //             y--;
    //             dy = dy - (2 * a_mul);
    //             d1 = d1 + dx - dy + b_mul;
    //         }
    //     }
    //     d2 = (b_mul * (x + 0.5) * (x + 0.5) + a_mul * (y - 1) * (y - 1) - a_mul * b_mul);
    //     while (y >= 0)
    //     {
    //         EllipsePoint(xc,yc,x,y,angle);
    //         y--;
    //         dy -= 2 * a_mul;
    //         if (d2 > 0)
    //         {
    //             d2 += a_mul - dy;
    //         }
    //         else
    //         {
    //             x++;
    //             dx += 2 * b_mul;
    //             d2 += dx - dy + a_mul;
    //         }
    //     }
    // }
    function DrawEllipse(xc, yc, a, b, angle,size,color) {
        for (let theta = 0; theta < 2 * Math.PI; theta += 0.01) {
            const x = xc + a * Math.cos(theta) * Math.cos(angle) - b * Math.sin(theta) * Math.sin(angle);
            const y = yc + a * Math.cos(theta) * Math.sin(angle) + b * Math.sin(theta) * Math.cos(angle);
            paper.fillStyle=color
            paper.fillRect(x, y, size, size);
        }
    }
    function is_in_trapezoid(mouseX,mouseY,Figure) {
        var halfHeight = Figure.heightTrapezoid;
        var halfTopWidth = Figure.topWidth;
        var halfBottomWidth = Figure.bottomWidth;

        // Calcular las coordenadas de los vértices del trapecio en base al ángulo de inclinación
        var topLeftX = Figure.firstPointX - halfTopWidth;
        var topLeftY = Figure.firstPointY - halfHeight;
        var topRightX = Figure.firstPointX + halfTopWidth;
        var topRightY = Figure.firstPointY - halfHeight;
        var bottomRightX = Figure.firstPointX + halfBottomWidth;
        var bottomRightY = Figure.firstPointY + halfHeight;
        var bottomLeftX = Figure.firstPointX - halfBottomWidth;
        var bottomLeftY = Figure.firstPointY + halfHeight;

        var rotatedTopLeft = rotatePoint(topLeftX, topLeftY, Figure.firstPointX, Figure.firstPointY, Figure.angle);
        var rotatedTopRight = rotatePoint(topRightX, topRightY, Figure.firstPointX, Figure.firstPointY, Figure.angle);
        var rotatedBottomRight = rotatePoint(bottomRightX, bottomRightY, Figure.firstPointX, Figure.firstPointY, Figure.angle);
        var rotatedBottomLeft = rotatePoint(bottomLeftX, bottomLeftY, Figure.firstPointX, Figure.firstPointY, Figure.angle);

        var trapezoidPolygon = [rotatedTopLeft, rotatedTopRight, rotatedBottomRight, rotatedBottomLeft];

        var inside = false;
        for (var i = 0, j = trapezoidPolygon.length - 1; i < trapezoidPolygon.length; j = i++) {
            var xi = trapezoidPolygon[i].x, yi = trapezoidPolygon[i].y;
            var xj = trapezoidPolygon[j].x, yj = trapezoidPolygon[j].y;

            var intersect = ((yi > mouseY) !== (yj > mouseY)) &&
                (mouseX < (xj - xi) * (mouseY - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }
    function is_mouse_in_figure(startX,startY,Figure){
        let x1,y1,x2,y2,numerator,denominator,distance,angle,width;
        switch (Figure.type) {
            case 'line':
                x1 = Figure.firstPointX;
                y1 = Figure.firstPointY;
                x2 = Figure.finalPointX;
                y2 = Figure.finalPointY;

                numerator = Math.abs((y2 - y1) * startX - (x2 - x1) * startY + x2 * y1 - y2 * x1);
                denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
                distance = numerator / denominator;

                const epsilon = 2; // Tamaño del área alrededor de la línea para considerar como "dentro"
                if (distance <= epsilon) {
                    return true;
                }
                break;
            case 'diamond':
                const halfWidth = Figure.width_rhombus;
                distance=Math.sqrt(Math.pow(startX-Figure.firstPointX,2)+Math.pow(startY-Figure.firstPointY,2));
                if (distance < halfWidth/2) {
                    return true;
                }
                break;
            case 'trapezoid':
                return is_in_trapezoid(startX,startY,Figure);
            case 'square':
                let lengthX = Math.abs(Figure.finalPointX-Figure.firstPointX);
                let lengthY = Math.abs(Figure.finalPointY-Figure.firstPointY);
                let length = Math.min(lengthX,lengthY);
                if(startX>=Figure.firstPointX && startX <=Figure.firstPointX+length*Figure.OrientX && startY>=Figure.firstPointY && startY<=Figure.firstPointY+length*Figure.OrientY){
                    return true;
                }
                break;
            case 'circle':
                distance=Math.sqrt(Math.pow(startX-Figure.firstPointX,2)+Math.pow(startY-Figure.firstPointY,2));
                if (distance < Figure.radius) {
                    return true;
                }
                break;
            case'rectangle':
                width = Math.abs(Figure.finalPointX-Figure.firstPointX);
                let height = Math.abs(Figure.finalPointY-Figure.firstPointY);
                if ((startX>=Figure.firstPointX && startX<=Figure.firstPointX+width*Figure.OrientX)&&(startY>=Figure.firstPointY && startY<=Figure.firstPointY+height*Figure.OrientY)){
                    return true;
                }
                break;
            case 'oval':
                let distanceX=Math.sqrt(Math.pow(startX-Figure.firstPointX,2));
                let distanceY=Math.sqrt(Math.pow(startY-Figure.firstPointY,2));
                if (distanceX<=Figure.a && distanceY<= Figure.b){
                    return true;
                }
                break;
            case 'pent':
                distance=Math.sqrt(Math.pow(startX-Figure.firstPointX,2)+Math.pow(startY-Figure.firstPointY,2));
                angle = Math.atan2(Figure.finalPointY - startY,Figure.finalPointX-startX);
                if (distance < Figure.radius && angle!==Figure.angle*5) {
                    console.log(Figure.angle*5);
                    return true;
                }
                else {
                    console.log(angle);
                }
                break;
            case 'hex':
                distance =Math.sqrt(Math.pow(startX-Figure.firstPointX,2)+Math.pow(startY-Figure.firstPointY,2));
                angle = Math.atan2(Figure.finalPointY - startY,Figure.finalPointX-startX);
                if (distance <= Figure.radius) {
                     return true;
                }
                break;
            case 'text':
                if (startY===Figure.firstPointY){
                    return true;
                }
                break;
            case 'pencil':
                break;
        }
        return false;
    }
    let isMove=false;
    function moverHaciaAtras(curfig) {
        // Verificar si el botón de mover hacia atrás está activado

        console.log(curfig);
        const index = figure.indexOf(curfig);
        if (index > 0) {
            // Intercambiar la posición de la figura seleccionada con la anterior
            [figure[index], figure[index - 1]] = [figure[index - 1], figure[index]];
            // Redibujar todas las figuras en el nuevo orden
            drawFigure();
        }

    }
    function moverHaciaAdelante(currfig) {
        const index = figure.indexOf(currfig);
        if (index < figure.length - 1) {
            // Guardar la figura que está adelante de la figura seleccionada
            const figuraSiguiente = figure[index + 1];
            // Colocar la figura siguiente en la posición actual de la figura seleccionada
            figure[index + 1] = currfig;
            // Colocar la figura seleccionada en la posición siguiente
            figure[index] = figuraSiguiente;
            // Redibujar todas las figuras en el nuevo orden
            drawFigure()
        }
    }
    function moverAlFondo(currfig) {
        const index = figure.indexOf(currfig);
        if (index > 0) {
            // Eliminar la figura seleccionada de su posición actual
            figure.splice(index, 1);
            // Insertar la figura al inicio de la lista
            figure.unshift(currfig);
            // Redibujar todas las figuras en el nuevo orden
            drawFigure()
        }
    }
    function moverAlFrente(currfig) {
        const index = figure.indexOf(currfig);
        if (index < figure.length - 1) {
            // Eliminar la figura seleccionada de su posición actual
            figure.splice(index, 1);
            // Insertar la figura al final de la lista
            figure.push(currfig);
            // Redibujar todas las figuras en el nuevo orden
            drawFigure();
        }
    }
    canvas.addEventListener('touchstart',function (e) {
        var touch = e.touches[0];
        var position = getPos(canvas,touch);
        if (modo==='atras'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    let current_fig= figure[index];
                    moverHaciaAtras(current_fig);
                    return;
                }
                index++;
            }
        }
        if (modo==='adelante'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    let current_fig= figure[index];
                    moverHaciaAdelante(current_fig);
                    return;
                }
                index++;
            }
        }
        if (modo==='fondo'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    let current_fig= figure[index];
                    moverAlFondo(current_fig);
                    return;
                }
                index++;
            }
        }
        if (modo==='frente'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    let current_fig= figure[index];
                    moverAlFrente(current_fig);
                    return;
                }
                index++;
            }
        }
        if (modo==='eraser_pix'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    isEraser=true;
                    return;
                }
                index++;
            }
        }
        if (modo==='eraser'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    figure.splice(index,1);
                    drawFigure();
                    return;
                }
                index++;
            }
        }
        if (modo==='rotate'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    isRotate=true;
                    return;
                }
                index++;
            }
        }
        if (modo==='scale'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    isScale=true;
                    firstPointX = position.x;
                    firstPointY = position.y;
                    console.log('entra');
                    return;
                }else{
                    console.log('no entra')}
                index++;
            }
        }
        if (modo==='move'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    isMove=true;
                    firstPointX = position.x;
                    firstPointY = position.y;
                    console.log('entra');
                    return;
                }else{
                    console.log('no entra')}
                index++;
            }
        }
        isDrawing = true;
        firstPointX = position.x;
        firstPointY = position.y;
    })
    canvas.addEventListener('mousedown',function(e){
        var position = getPos(canvas,e);
        if (modo==='atras'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    let current_fig= figure[index];
                    moverHaciaAtras(current_fig);
                    return;
                }
                index++;
            }
        }
        if (modo==='adelante'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    let current_fig= figure[index];
                    moverHaciaAdelante(current_fig);
                    return;
                }
                index++;
            }
        }
        if (modo==='fondo'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    let current_fig= figure[index];
                    moverAlFondo(current_fig);
                    return;
                }
                index++;
            }
        }
        if (modo==='frente'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    let current_fig= figure[index];
                    moverAlFrente(current_fig);
                    return;
                }
                index++;
            }
        }
        if (modo==='eraser_pix'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    isEraser=true;
                    return;
                }
                index++;
            }
        }
        if (modo==='eraser'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    figure.splice(index,1);
                    drawFigure();
                    return;
                }
                index++;
            }
        }
        if (modo==='rotate'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    isRotate=true;
                    return;
                }
                index++;
            }
        }
        if (modo==='scale'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    isScale=true;
                    firstPointX = position.x;
                    firstPointY = position.y;
                    console.log('entra');
                    return;
                }else{
                    console.log('no entra')}
                index++;
            }
        }
        if (modo==='move'){
            let index = 0;
            for (let fig of figure){
                if (is_mouse_in_figure(position.x,position.y,fig)){
                    current_index = index;
                    isMove=true;
                    firstPointX = position.x;
                    firstPointY = position.y;
                    console.log('entra');
                    return;
                }else{
                    console.log('no entra')}
                index++;
            }
        }
        isDrawing = true;
        firstPointX = position.x;
        firstPointY = position.y;
    });
    function Scale(curr_fig,pos) {
        let OrientX,OrientY,radio,width,height;
        switch (curr_fig.type) {
            case 'square':
                let lengthX = Math.abs(pos.x-curr_fig.firstPointX);
                let lengthY = Math.abs(pos.y-curr_fig.firstPointY);
                let length = Math.min(lengthX,lengthY);
                curr_fig.OrientX = Math.sign(pos.x-curr_fig.firstPointX);
                curr_fig.OrientY = Math.sign(pos.y-curr_fig.firstPointY);
                curr_fig.len=length;
                break;
            case 'line':
                let dx = pos.x - firstPointX;
                let dy = pos.y - firstPointY;
                curr_fig.firstPointX += dx;
                curr_fig.firstPointY -= dy;
                curr_fig.finalPointX -= dx;
                curr_fig.finalPointY += dy;
                break;
            case 'circle':
                radio = Math.sqrt(Math.pow(pos.x-curr_fig.firstPointX,2)+Math.pow(pos.y-curr_fig.firstPointY,2));
                curr_fig.radius = radio;
                break;
            case 'oval':
                 curr_fig.a = Math.abs(pos.x-curr_fig.firstPointX);
                 curr_fig.b = Math.abs(pos.y-curr_fig.firstPointY);
                break;
            case 'rectangle':
                curr_fig.width_rect = Math.abs(pos.x-curr_fig.firstPointX);
                curr_fig.height_rect = Math.abs(pos.y-curr_fig.firstPointY);
                curr_fig.OrientX = Math.sign(pos.x-curr_fig.firstPointX);
                curr_fig.OrientY = Math.sign(pos.y-curr_fig.firstPointY);
                break;
            case 'pent':
                radio = Math.sqrt(Math.pow(pos.x-curr_fig.firstPointX,2)+Math.pow(pos.y-curr_fig.firstPointY,2));
                curr_fig.radius = radio;
                break;
            case 'hex':
                radio = Math.sqrt(Math.pow(pos.x-curr_fig.firstPointX,2)+Math.pow(pos.y-curr_fig.firstPointY,2));
                curr_fig.radius = radio;
                break;
            case 'trapezoid':
                curr_fig.bottomWidth = Math.abs(pos.x-curr_fig.firstPointX);
                curr_fig.topWidth = curr_fig.bottomWidth/2;
                curr_fig.heightTrapezoid= Math.abs(pos.y-curr_fig.firstPointY);
                break;
            case 'diamond':
                curr_fig.width_rhombus = Math.abs(pos.x-firstPointX);
                curr_fig.height_rhombus= Math.abs(pos.y-firstPointY);
                break;

        }
    }
    function rotateFig(curr_fig,pos) {
        let OrientX,OrientY,radio,angle,dx,dy;
        switch (curr_fig.type) {
            case 'square':
                angle=Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
                curr_fig.angle = angle;
                break;
            case 'line':
                dx = pos.x - firstPointX;
                dy = pos.y - firstPointY;
                curr_fig.firstPointX += dx;
                curr_fig.firstPointY -= dy;
                curr_fig.finalPointX -= dx;
                curr_fig.finalPointY += dy;
                break;
            case 'circle':
                radio = Math.sqrt(Math.pow(pos.x-curr_fig.firstPointX,2)+Math.pow(pos.y-curr_fig.firstPointY,2));
                curr_fig.radius = radio;
                break;
            case 'oval':
                angle=Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
                curr_fig.angle = angle;
                break;
            case 'rectangle':
                angle=Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
                curr_fig.angle = angle;
                break;
            case 'pent':
                angle=Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
                curr_fig.angle = angle;
                break;
            case 'hex':
                angle=Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
                curr_fig.angle = angle;
                break;
            case 'trapezoid':
                angle=Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
                curr_fig.angle = angle;
                break
            case 'diamond':
                angle=Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
                curr_fig.angle = angle;
        }
    }
    function borrarFiguraPorPixeles(figuraABorrar) {
        // for (let i = 0; i < figuraABorrar.length; i++) {
        //         // Obtener las coordenadas de los píxeles de la figura a borrar
        //         // let coordenadasPixeles = figuraABorrar.obtenerCoordenadasPixeles();
        //         //
        //         // // Borrar los píxeles de la figura en el lienzo
        //         // for (let j = 0; j < coordenadasPixeles.length; j++) {
        //         //     let coordenada = coordenadasPixeles[j];
        //         //     borrarPixel(coordenada.x, coordenada.y); // Suponiendo que tienes una función para borrar un píxel
        //         // }
        //
        //         // Eliminar la figura del vector
        //         figuraABorrar.splice(i, 3);
        //         break;
        // }

    }
    let erasePoints=[];
    canvas.addEventListener('touchmove',function (e) {
        e.preventDefault();
        var touch = e.touches[0];
        var pos = getPos(canvas, touch);
        if (isEraser){
            let current_fig= figure[current_index];
            //borrarFiguraPorPixeles(current_fig);
            erasePoints.push({x:pos.x,y:pos.y});
            paper.clearRect(pos.x,pos.y,4,4);

        }
        if (isRotate){
            let current_fig= figure[current_index];
            rotateFig(current_fig,pos);
            drawFigure();
        }
        if (isScale){
            let current_fig= figure[current_index];
            Scale(current_fig,pos);
            drawFigure();
        }
        if(isMove){
            let current_fig= figure[current_index];
            let dx = pos.x - firstPointX;
            let dy = pos.y - firstPointY;
            current_fig.firstPointX += dx;
            current_fig.firstPointY += dy;
            current_fig.finalPointX += dx;
            current_fig.finalPointY += dy;
            drawFigure();
            firstPointX = pos.x;
            firstPointY = pos.y;
        }
        if(!isDrawing)return;
        if (isDrawing){
            var position = getPos(canvas, touch);
            finalPointX = position.x;
            finalPointY = position.y;
            if(modo==='pencil'){
                Pencil(finalPointX,finalPointY);
            }else{
                drawFigure();
            }
        }
    })
    canvas.addEventListener('mousemove',function(e){
        var pos = getPos(canvas,e);
        if (isEraser){
            let current_fig= figure[current_index];
            //borrarFiguraPorPixeles(current_fig);
            erasePoints.push({x:pos.x,y:pos.y});
            paper.clearRect(pos.x,pos.y,4,4);

        }
        if (isRotate){
            let current_fig= figure[current_index];
            rotateFig(current_fig,pos);
            drawFigure();
        }
        if (isScale){
            let current_fig= figure[current_index];
            Scale(current_fig,pos);
            drawFigure();
        }
        if(isMove){
            let current_fig= figure[current_index];
            let dx = pos.x - firstPointX;
            let dy = pos.y - firstPointY;
            current_fig.firstPointX += dx;
            current_fig.firstPointY += dy;
            current_fig.finalPointX += dx;
            current_fig.finalPointY += dy;
            drawFigure();
            firstPointX = pos.x;
            firstPointY = pos.y;
        }
        if(!isDrawing)return;
        if (isDrawing){
            var position = getPos(canvas,e);
            finalPointX = position.x;
            finalPointY = position.y;
            if(modo==='pencil'){
                Pencil(finalPointX,finalPointY,sinsel_size,Color_line);
            }else{
                drawFigure();
            }
        }
    });
    let pointsPencil=[]
    function Pencil(x,y,size,color){
        paper.beginPath();
        paper.strokeStyle = color;
        paper.lineWidth = size;
        paper.lineCap = 'round';
        paper.moveTo(firstPointX,firstPointY);
        pointsPencil.push({x:x,y:y});
        paper.lineTo(x,y);
        paper.lineJoin = 'round';
        paper.closePath();
        paper.stroke();
        firstPointX = x;
        firstPointY = y;
    }
    function redrawpoints(handDrawnPoints,size,color){
        let index=0;
        for (let point of handDrawnPoints.points){
            if (index === 0) {
                console.log(point.x,point.y);
                // Si es el primer punto, lo movemos a esa posición
                paper.moveTo(point.x, point.y);
            } else {
                // Para los puntos siguientes, dibujamos una línea desde el punto anterior hasta este
                paper.lineTo(point.x, point.y);
                console.log(point.x,point.y);
            }
            index++;
        }
        // Establecemos el estilo de línea y la dibujamos
        paper.lineWidth = size; // Grosor de la línea
        paper.strokeStyle = color; // Color de la línea
        paper.stroke();
    }
    function drawcircle(xc,yc,x,y,size,color){
        paper.fillStyle = color;
        paper.fillRect(xc+x,yc+y,size,size);
        paper.fillRect(xc-x,yc+y,size,size);
        paper.fillRect(xc+x,yc-y,size,size);
        paper.fillRect(xc-x,yc-y,size,size);
        paper.fillRect(xc+y,yc+x,size,size);
        paper.fillRect(xc-y,yc+x,size,size);
        paper.fillRect(xc+y,yc-x,size,size);
        paper.fillRect(xc-y,yc-x,size,size);
    }
    function circleBres(xc, yc, r,size,color)
    { 
        let x = 0, y = r; 
        let d = 3 - 2 * r;
        while (y >= x)
        {
            drawcircle(xc, yc, x, y,size,color);
            x++; 
            if (d > 0) 
            { 
                y--;  
                d += 4 * (x - y) + 10;
            } 
            else{
                d += 4 * x + 6;
            }
        }
    }
    function DDA(x0,y0,x1,y1,size,color){
        var dx,dy,incx,incy,x,y,p;
        dx = x1-x0;
        dy = y1-y0;
        if (Math.abs(dx)>=Math.abs(dy)){
            p=Math.abs(dx);
        }else {
            p=Math.abs(dy);
        }
        incx= dx/p;
        incy=dy/p;
        x=x0;
        y=y0;
        for (var i =0; i<=p; i++){
            paper.fillStyle = color;
            paper.fillRect(x,y,size,size);
            x+=incx;
            y+=incy;
        }
    }
    // function square(x0,y0,length,OrientX,OrientY){
    //     let x1= x0+length*OrientX;
    //     let y1= y0+length*OrientY;
    //     DDA(x0,y0,x1,y0);
    //     DDA(x1,y0,x1,y1);
    //     DDA(x1,y1,x0,y1);
    //     DDA(x0,y1,x0,y0);
    // }
    function rotatePoint(x, y, x0, y0, angle) {
        var newX = (x - x0) * Math.cos(angle) - (y - y0) * Math.sin(angle) + x0;
        var newY = (x - x0) * Math.sin(angle) + (y - y0) * Math.cos(angle) + y0;
        return { x: newX, y: newY };
    }

    function square(x0, y0, length, OrientX, OrientY, angle,color,size) {
        if (angle!==0){
            var x = x0 - length / 2;
            var y = y0 - length / 2;
            var x1 = x0 + length / 2;
            var y1 = y0 - length / 2;
            var x2 = x0 + length / 2;
            var y2 = y0 + length / 2;
            var x3 = x0 - length / 2;
            var y3 = y0 + length / 2;

            // Rotar cada vértice del cuadrado alrededor del centro
            var rotatedX0Y0 = rotatePoint(x, y, x0, y0, angle);
            var rotatedX1Y1 = rotatePoint(x1, y1, x0, y0, angle);
            var rotatedX2Y2 = rotatePoint(x2, y2, x0, y0, angle);
            var rotatedX3Y3 = rotatePoint(x3, y3, x0, y0, angle);

            // Dibujar las líneas que conectan los vértices rotados para formar el cuadrado
            DDA(rotatedX0Y0.x, rotatedX0Y0.y, rotatedX1Y1.x, rotatedX1Y1.y,size,color);
            DDA(rotatedX1Y1.x, rotatedX1Y1.y, rotatedX2Y2.x, rotatedX2Y2.y,size,color);
            DDA(rotatedX2Y2.x, rotatedX2Y2.y, rotatedX3Y3.x, rotatedX3Y3.y,size,color);
            DDA(rotatedX3Y3.x, rotatedX3Y3.y, rotatedX0Y0.x, rotatedX0Y0.y,size,color);
        }
        else {
            let x1= x0+length*OrientX;
            let y1= y0+length*OrientY;
            DDA(x0,y0,x1,y0,size,color);
            DDA(x1,y0,x1,y1,size,color);
            DDA(x1,y1,x0,y1,size,color);
            DDA(x0,y1,x0,y0,size,color);
        }
    }
    const acordion_content = document.querySelectorAll('.accordion-content');
    acordion_content.forEach((item, index)=>{
        let header = item.querySelector('header');
        header.addEventListener('click',()=>{
            item.classList.toggle("open");
            let description = item.querySelector('.description');
            let chev= item.querySelector('.tab');
            if(item.classList.contains("open")){
                description.style.height = `${description.scrollHeight}px`;
                chev.style.rotate = "180deg";
            }else{
                description.style.height = "0px";
                chev.style.rotate = "0deg";
            }
        })
    })
    function Rectangle(x0,y0,x1,y1,width,height,OrientX,OrientY,angle,size,color){
        if (angle!==0){
            var x = x0 - width / 2;
            var y = y0 - height / 2;
            var x1_1 = x0 + width / 2;
            var y1_1 = y0 - height / 2;
            var x2 = x0 + width / 2;
            var y2 = y0 + height / 2;
            var x3 = x0 - width / 2;
            var y3 = y0 + height / 2;

            // Rotar cada vértice del cuadrado alrededor del centro
            var rotatedX0Y0 = rotatePoint(x, y, x0, y0, angle);
            var rotatedX1Y1 = rotatePoint(x1_1, y1_1, x0, y0, angle);
            var rotatedX2Y2 = rotatePoint(x2, y2, x0, y0, angle);
            var rotatedX3Y3 = rotatePoint(x3, y3, x0, y0, angle);

            // Dibujar las líneas que conectan los vértices rotados para formar el cuadrado
            DDA(rotatedX0Y0.x, rotatedX0Y0.y, rotatedX1Y1.x, rotatedX1Y1.y,size,color);
            DDA(rotatedX1Y1.x, rotatedX1Y1.y, rotatedX2Y2.x, rotatedX2Y2.y,size,color);
            DDA(rotatedX2Y2.x, rotatedX2Y2.y, rotatedX3Y3.x, rotatedX3Y3.y,size,color);
            DDA(rotatedX3Y3.x, rotatedX3Y3.y, rotatedX0Y0.x, rotatedX0Y0.y,size,color);
        }else{
            let x = x0+width*OrientX;
            let y= y0+height*OrientY;
            DDA(x0,y0,x,y0,size,color);
            DDA(x,y0,x,y,size,color);
            DDA(x,y,x0,y,size,color);
            DDA(x0,y,x0,y0,size,color);
        }
    }
    function grade_to_points(CenterX,CenterY,radio,angle){
        let pointX= Math.round(CenterX+radio*Math.cos(angle));
        let pointY= Math.round(CenterY+radio*Math.sin(angle));
        return{x:pointX,y:pointY}
    }
    function draw_Polygon(radio,centerX,centerY,Sides,angle,size,color){
        var initialAngle = (2*Math.PI)/Sides,lastX=0,lastY=0;
        for (let i = 0; i < Sides;i++) {
            let step = i*initialAngle+angle;
            let points= grade_to_points(centerX,centerY,radio,step);
            if(i>0){
                DDA(lastX,lastY,points.x,points.y,size,color);
            }
            lastX = points.x;
            lastY = points.y;
        }
        DDA(lastX,lastY,Math.round(centerX + radio * Math.cos(angle)),Math.round(centerY + radio * Math.sin(angle)),size,color)
    }
    function UPevent(){
        if (isEraser){
            isEraser=false;
            figure.push({type:'action',subtype:'erase',erasePoints:erasePoints});
        }
        if (isRotate){
            isRotate=false;
        }
        if (isScale){
            isScale=false;
        }
        if (isMove){
            isMove=false;
        }
        if(isDrawing){
            let OrientX,OrientY,angle,radio,width,height;
            isDrawing=false;
            switch (modo){
                case "pencil":
                    figure.push({type:'pencil',points:pointsPencil,sinsel_size:sinsel_size,color:Color_line});
                    pointsPencil=[];
                    console.log(figure);
                    break;
                case "line":
                    figure.push({type:'line',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,sinsel_size:sinsel_size,color:Color_line});
                    break;
                case "square":
                    let lengthX = Math.abs(finalPointX-firstPointX);
                    let lengthY = Math.abs(finalPointY-firstPointY);
                    let length = Math.min(lengthX,lengthY);
                    OrientX = Math.sign(finalPointX-firstPointX);
                    OrientY = Math.sign(finalPointY-firstPointY);
                    figure.push({type:'square',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,len:length,OrientX:OrientX,
                        OrientY:OrientY,angle:0,sinsel_size:sinsel_size,color: Color_line});
                    break;
                case 'rectangle':
                    width = Math.abs(finalPointX-firstPointX);
                    height = Math.abs(finalPointY-firstPointY);
                    OrientX = Math.sign(finalPointX-firstPointX);
                    OrientY = Math.sign(finalPointY-firstPointY);
                    figure.push({type:'rectangle',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,width_rect:width,height_rect:height,
                        OrientX:OrientX,OrientY:OrientY,angle:0,sinsel_size:sinsel_size,color: Color_line});
                    break;
                case "circle":
                    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
                    figure.push({type:'circle',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,radius:radio,sinsel_size:sinsel_size,color: Color_line});
                    break;
                case 'oval':
                    var a = Math.abs(finalPointX-firstPointX);
                    var b = Math.abs(finalPointY-firstPointY);
                    figure.push({type:'oval',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,a:a,b:b,angle:0,sinsel_size:sinsel_size,color: Color_line});
                    break;
                case 'pent':
                    angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
                    figure.push({type:'pent',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,radius:radio,sides:5,angle:angle,sinsel_size:sinsel_size,color: Color_line});
                    break;
                case 'hex':
                    angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
                    figure.push({type:'hex',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,radius:radio,sides:6,angle:angle,sinsel_size:sinsel_size,color: Color_line});
                    break;
                case 'diamond':
                    width = Math.abs(finalPointX-firstPointX);
                    height= Math.abs(finalPointY-firstPointY);
                    figure.push({type:'diamond',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,width_rhombus:width,height_rhombus:height, angle:0,sinsel_size:sinsel_size,color: Color_line});
                    break;
                case 'trapezoid':
                    width = Math.abs(finalPointX-firstPointX);
                    height= Math.abs(finalPointY-firstPointY);
                    figure.push({type:'trapezoid',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,topWidth:width/2,bottomWidth:width,heightTrapezoid:height,angle:0,sinsel_size:sinsel_size,color: Color_line});
                    break;
                case 'triangle':
                    angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
                    figure.push({type:'hex',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,radius:radio,sides:3,angle:angle,sinsel_size:sinsel_size,color: Color_line});
                    break;
            }
        }else{

            //drawFigure();
        }
    }
    canvas.addEventListener('touchend',function (){
        UPevent();
    })
    canvas.addEventListener('mouseup',function (e){
        UPevent();
    });
    // function AddText() {
    //     document.addEventListener('keydown',function (e){
    //         if (e.keyCode===13){
    //         }else {
    //
    //         }
    //     });
    // }
    let TrapezoidPoints;
    function SetTrapezoidPoints(point0,point1,point2,point3) {
        return TrapezoidPoints={x0:point0.x,y0:point0.y,x1:point1.x,y1:point1.y,x2:point2.x,y2:point2.y,x3:point3.x,y3:point3.y};
    }
    function draw_Rhombus(x0,y0,length,angle,size,color) {
        var halfDiagonal = length;
        var xOffset = halfDiagonal * Math.cos(Math.PI / 4);
        var yOffset = halfDiagonal * Math.sin(Math.PI / 4);

        var rotatedX0Y0 = rotatePoint(x0, y0 - halfDiagonal, x0, y0, angle);
        var rotatedX1Y1 = rotatePoint(x0 + xOffset, y0, x0, y0, angle);
        var rotatedX2Y2 = rotatePoint(x0, y0 + halfDiagonal, x0, y0, angle);
        var rotatedX3Y3 = rotatePoint(x0 - xOffset, y0, x0, y0, angle);
        DDA(rotatedX0Y0.x, rotatedX0Y0.y, rotatedX1Y1.x, rotatedX1Y1.y,size,color);
        DDA(rotatedX1Y1.x, rotatedX1Y1.y, rotatedX2Y2.x, rotatedX2Y2.y,size,color);
        DDA(rotatedX2Y2.x, rotatedX2Y2.y, rotatedX3Y3.x, rotatedX3Y3.y,size,color);
        DDA(rotatedX3Y3.x, rotatedX3Y3.y, rotatedX0Y0.x, rotatedX0Y0.y,size,color);
    }
    function drawTrapezoid(x, y, topWidth, bottomWidth, height, angle,size,color) {
        var halfHeight = height;
        var halfTopWidth = topWidth;
        var halfBottomWidth = bottomWidth;

        // Calcular las coordenadas de los vértices del trapecio en base al ángulo de inclinación
        var topLeftX = x - halfTopWidth;
        var topLeftY = y - halfHeight;
        var topRightX = x + halfTopWidth;
        var topRightY = y - halfHeight;
        var bottomRightX = x + halfBottomWidth;
        var bottomRightY = y + halfHeight;
        var bottomLeftX = x - halfBottomWidth;
        var bottomLeftY = y + halfHeight;

        var rotatedTopLeft = rotatePoint(topLeftX, topLeftY, x, y, angle);
        var rotatedTopRight = rotatePoint(topRightX, topRightY, x, y, angle);
        var rotatedBottomRight = rotatePoint(bottomRightX, bottomRightY, x, y, angle);
        var rotatedBottomLeft = rotatePoint(bottomLeftX, bottomLeftY, x, y, angle);

        DDA(rotatedTopLeft.x,rotatedTopLeft.y,rotatedTopRight.x, rotatedTopRight.y,size,color);
        DDA(rotatedTopRight.x, rotatedTopRight.y,rotatedBottomRight.x, rotatedBottomRight.y,size,color);
        DDA(rotatedBottomRight.x, rotatedBottomRight.y,rotatedBottomLeft.x, rotatedBottomLeft.y,size,color);
        DDA(rotatedBottomLeft.x, rotatedBottomLeft.y,rotatedTopLeft.x,rotatedTopLeft.y,size,color)
    }
    const textarea = document.getElementById('txt_area');
    function drawFigure(){
        paper.clearRect(0,0,canvas.width,canvas.height);
        for(var i=0;i<figure.length;i++){
            let fig = figure[i];
            paper.beginPath();
            switch (fig.type) {
                case'action':
                    if (fig.subtype==='erase'){
                        for (let point of fig.erasePoints) {
                            // Dibuja el punto en el lienzo
                            paper.clearRect(point.x, point.y, 4, 4); // Dibuja un píxel en la posición del punto
                        }
                    }
                    break
                case 'pencil':
                    redrawpoints(fig,fig.sinsel_size,fig.color)
                    break;
                case 'circle':
                    let h,k;
                    h=fig.firstPointX
                    k=fig.firstPointY
                    circleBres(h,k,fig.radius,fig.sinsel_size,fig.color);
                    break;
                case 'square':
                    square(fig.firstPointX,fig.firstPointY,fig.len, fig.OrientX,fig.OrientY,fig.angle,fig.color,fig.sinsel_size);
                    break;
                case 'rectangle':
                    Rectangle(fig.firstPointX,fig.firstPointY,fig.finalPointX,fig.finalPointY,fig.width_rect,fig.height_rect,fig.OrientX,fig.OrientY,fig.angle,fig.sinsel_size,fig.color);
                    break;
                case 'oval':
                    DrawEllipse(fig.firstPointX,fig.firstPointY,fig.a,fig.b,fig.angle,fig.sinsel_size,fig.color);
                    break;
                case 'line':
                    DDA(fig.firstPointX,fig.firstPointY,fig.finalPointX,fig.finalPointY,fig.sinsel_size,fig.color);
                    break;
                case 'pent':
                    draw_Polygon(fig.radius,fig.firstPointX,fig.firstPointY,fig.sides,fig.angle,fig.sinsel_size,fig.color);
                    break;
                case 'hex':
                    draw_Polygon(fig.radius,fig.firstPointX,fig.firstPointY,fig.sides,fig.angle,fig.sinsel_size,fig.color);
                    break;
                case 'diamond':
                    draw_Rhombus(fig.firstPointX,fig.firstPointY,fig.width_rhombus,fig.angle,fig.sinsel_size,fig.color);
                    break;
                case 'triangle':
                    draw_Polygon(fig.radius,fig.firstPointX,fig.firstPointY,fig.sides,fig.angle,fig.sinsel_size,fig.color);
                    break;
                case 'trapezoid':
                    drawTrapezoid(fig.firstPointX,fig.firstPointY,fig.topWidth,fig.bottomWidth,fig.heightTrapezoid,fig.angle,fig.sinsel_size,fig.color);
                    break;
                case 'text':
                    drawtext(fig.text_value,fig.firstPointX,fig.firstPointY);
                    break;
            }
        }
        if (isDrawing){
            let radio=0,angle=0,OrientX,OrientY,width,height;
            switch (modo){
                case "circle":
                    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
                    circleBres(firstPointX,firstPointY,radio,sinsel_size,Color_line);
                    break;
                case 'oval':
                    var a = Math.abs(finalPointX-firstPointX);
                    var b = Math.abs(finalPointY-firstPointY);
                    DrawEllipse(firstPointX,firstPointY,a,b,0,sinsel_size,Color_line);
                    break;
                case 'square':
                    let lengthX = Math.abs(finalPointX-firstPointX);
                    let lengthY = Math.abs(finalPointY-firstPointY);
                    let length = Math.min(lengthX,lengthY);
                    OrientX = Math.sign(finalPointX-firstPointX);
                    OrientY = Math.sign(finalPointY-firstPointY);
                    square(firstPointX,firstPointY,length,OrientX,OrientY,0,Color_line,sinsel_size);
                    break;
                case 'rectangle':
                    width = Math.abs(finalPointX-firstPointX);
                    height = Math.abs(finalPointY-firstPointY);
                    OrientX = Math.sign(finalPointX-firstPointX);
                    OrientY = Math.sign(finalPointY-firstPointY);
                    Rectangle(firstPointX,firstPointY,finalPointX,finalPointY,width,height,OrientX,OrientY,0,sinsel_size,Color_line);
                    break;
                case "line":
                    DDA(firstPointX,firstPointY,finalPointX,finalPointY,sinsel_size,Color_line);
                    break;
                case 'pent':
                    angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
                    draw_Polygon(radio,firstPointX,firstPointY,5,angle,sinsel_size,Color_line);
                    break;
                case 'hex':
                    angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
                    draw_Polygon(radio,firstPointX,firstPointY,6,angle,sinsel_size,Color_line);
                    break;
                case 'diamond':
                    width = Math.abs(finalPointX-firstPointX);
                    angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                    draw_Rhombus(firstPointX,firstPointY,width,0,sinsel_size,Color_line);
                    break;
                case 'trapezoid':
                    width = Math.abs(finalPointX-firstPointX);
                    height= Math.abs(finalPointY-firstPointY);
                    drawTrapezoid(firstPointX,firstPointY,width/2,width,height,0,sinsel_size,Color_line)
                    break;
                case 'triangle':
                    angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
                    draw_Polygon(radio,firstPointX,firstPointY,3,angle,sinsel_size,Color_line);
                    break;
            }
        }
        paper.closePath();
    }
    let hasInput = false;
    canvas.addEventListener('click',function (e) {
        if (modo==='text'){
            if (hasInput){return}
            addInput(firstPointX,firstPointY,e);
        }else {return}
    })
    function addInput(x, y,ev) {
        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.left = ev.pageX + 'px';
        input.style.top = ev.pageY + 'px';
        input.onkeydown = handleEnter;
        document.body.appendChild(input);
        input.focus();
        hasInput = true;
    }
    function handleEnter(e) {
        const keyCode = e.keyCode;
        console.log(keyCode);
        if (keyCode === 13) {
            drawtext(this.value, firstPointX, firstPointY);
            figure.push({type:'text',firstPointX:firstPointX,firstPointY:firstPointY,text_value:this.value});
            document.body.removeChild(this);
            hasInput = false;
        }
    }
    function drawtext(txt,x, y) {
        paper.font = '25px Arial';
        paper.fillText(txt, x, y);
    }
    function getPos(canvas,event){
        var rect = canvas.getBoundingClientRect();
        return{
            x:event.clientX - rect.left,
            y:event.clientY - rect.top
        };
    }
});

let fillButton = document.getElementById('fill');

// Variables para guardar las coordenadas y el color seleccionado
let clickX, clickY;
let selectedColor = 'black'; // Color por defecto

// Agregar evento de clic al lienzo para obtener coordenadas del clic
canvas.addEventListener('click', function(event) {
    clickX = event.offsetX;
    clickY = event.offsetY;
});

// Agregar evento de clic a los botones de color para capturar el color seleccionado
document.querySelectorAll('.color').forEach(button => {
    button.addEventListener('click', function() {
        selectedColor = this.value;
    });
});

// Agregar evento de clic al botón de relleno
fillButton.addEventListener('click', function() {
    if (clickX !== undefined && clickY !== undefined) {
        floodFill(clickX, clickY, selectedColor);
    } else {
        console.log('Por favor, haz clic en el lienzo para seleccionar las coordenadas.');
    }
});

function floodFill(x, y, color) {
    // Obtener el color del píxel en las coordenadas dadas
    let targetColor = paper.getImageData(x, y, 1, 1).data;

    // Verificar si el color de destino es igual al color de relleno
    if (colorsMatch(targetColor, color)) {
        return;
    }

    // Crear una cola para almacenar los píxeles por visitar
    let queue = [{ x: x, y: y }];

    // Función para verificar si dos colores son iguales
    function colorsMatch(color1, color2) {
        return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2] && color1[3] === color2[3];
    }

    // Lógica de relleno
    while (queue.length > 0) {
        let current = queue.shift();
        let cx = current.x;
        let cy = current.y;

        // Obtener el color del píxel actual
        let currentColor = paper.getImageData(cx, cy, 1, 1).data;

        // Verificar si el color del píxel actual es igual al color de destino
        if (colorsMatch(currentColor, targetColor)) {
            // Establecer el color del píxel actual
            paper.fillStyle = color;

            // Expandir el relleno horizontalmente hacia la izquierda
            let leftBound = cx;
            while (leftBound >= 0 && colorsMatch(paper.getImageData(leftBound, cy, 1, 1).data, targetColor)) {
                leftBound--;
            }

            // Expandir el relleno horizontalmente hacia la derecha
            let rightBound = cx + 1;
            while (rightBound < canvas.width && colorsMatch(paper.getImageData(rightBound, cy, 1, 1).data, targetColor)) {
                rightBound++;
            }

            // Rellenar la fila completa con el color
            paper.fillRect(leftBound + 1, cy, rightBound - leftBound - 1, 1);

            // Explorar hacia arriba y hacia abajo desde la fila rellenada
            if (cy > 0) {
                for (let i = leftBound + 1; i < rightBound; i++) {
                    if (colorsMatch(paper.getImageData(i, cy - 1, 1, 1).data, targetColor)) {
                        queue.push({ x: i, y: cy - 1 });
                    }
                }
            }
            if (cy < canvas.height - 1) {
                for (let i = leftBound + 1; i < rightBound; i++) {
                    if (colorsMatch(paper.getImageData(i, cy + 1, 1, 1).data, targetColor)) {
                        queue.push({ x: i, y: cy + 1 });
                    }
                }
            }
        }
    }
}
