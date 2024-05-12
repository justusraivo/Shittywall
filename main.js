document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    canvas.getContext('2d', { willReadFrequently: true });
   
   
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  
  
    // Muut koodit ja tapahtumankäsittelijät...
  

  
    let isDrawing = false;
    let isErasing = false;
    let isAddingText = false;
  
    let lineWidth = 5;
    let strokeColor = "#000";
    let fontSize = 20;
  
    let drawingHistory = []; // Taulukko tallentamaan piirtoaskeleet
  
    const colorPicker = document.getElementById("colorPicker");
    const changeCanvasButton = document.getElementById("changeCanvas");
    const brushSize = document.getElementById("brushSize");
   
    const textInput = document.getElementById("textInput");
    const fontSizeInput = document.getElementById("fontSizeInput");
    const addTextButton = document.getElementById("addTextButton");
    const undoButton = document.getElementById("undoButton"); // Uusi nappi kumomista varten
  
    colorPicker.addEventListener("input", function () {
      strokeColor = colorPicker.value;
    });
  
    changeCanvasButton.addEventListener("click", function () {
      const newColor = colorPicker.value;
      changeCanvasColor(newColor);
    });

    

    randomColor();

    function randomColor() {
    
      var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16); 
  
      context.fillStyle = randomColor;
      context.fillRect(0, 0, canvas.width, canvas.height);  
  }
    function changeCanvasColor(newColor) {
      // Aseta uusi taustaväri
      context.fillStyle = newColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      
    }
  
    brushSize.addEventListener("input", function () {
      lineWidth = brushSize.value;
    });
  
   
  

  
    fontSizeInput.addEventListener("input", function () {
      fontSize = fontSizeInput.value;
    });
  
    addTextButton.addEventListener("click", function () {
      isAddingText = !isAddingText;
      addTextButton.innerText = isAddingText ? "Stop Adding" : "Add Text";
      if (!isAddingText) {
        textInput.value = "";
      }
    });
  
    undoButton.addEventListener("click", function () {
      undoDraw();
    });
  
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.strokeStyle = strokeColor;
  
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    document.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
  
    // Kosketustapahtumat
    window.addEventListener('touchstart', onTouchStart, { passive: true });

function onTouchStart(event) {
    // Tapahtumankäsittelijän toiminta
}

    canvas.addEventListener("touchstart", startDrawingTouch);
    canvas.addEventListener("touchmove", drawTouch);
    canvas.addEventListener("touchend", stopDrawing);
  
    function startDrawing(e) {
      if (isAddingText) {
        addText(e);
      } else {
        isDrawing = true;
        context.beginPath();
        context.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
        draw(e);
      }
    }
  
    function draw(e) {
        if (!isDrawing || isAddingText) return;

        context.lineWidth = lineWidth;
        context.strokeStyle = isErasing ? "#ffffff" : strokeColor;

    context.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    context.stroke();
    context.beginPath();
    context.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);

    // Tallenna piirtoaskeleet
    const step = {
      type: "draw",
      data: context.getImageData(0, 0, canvas.width, canvas.height),
    };
    drawingHistory.push(step);
  }

  function stopDrawing() {
    if (isAddingText) return;
    isDrawing = false;
    context.beginPath();
  }

  function startDrawingTouch(e) {
    if (isAddingText) {
      addText(e.touches[0]); // Käytä ensimmäistä kosketuspistettä
    } else {
      const rect = canvas.getBoundingClientRect();
      isDrawing = true;
      context.beginPath();
      context.moveTo(e.touches[0].pageX - rect.left, e.touches[0].pageY - rect.top); // Muuta clientX ja clientY pageX ja pageY:ksi
      drawTouch(e);
    }
  }
  
  function drawTouch(e) {
    if (!isDrawing || isAddingText) return;
  
    const rect = canvas.getBoundingClientRect();
    context.lineWidth = lineWidth;
    context.strokeStyle = isErasing ? "#ffffff" : strokeColor;
  
    context.lineTo(e.touches[0].pageX - rect.left, e.touches[0].pageY - rect.top); // Muuta clientX ja clientY pageX ja pageY:ksi
    context.stroke();
    context.beginPath();
    context.moveTo(e.touches[0].pageX - rect.left, e.touches[0].pageY - rect.top); // Muuta clientX ja clientY pageX ja pageY:ksi
  
    // Tallenna piirtoaskeleet
    const step = {
      type: "draw",
      data: context.getImageData(0, 0, canvas.width, canvas.height),
    };
    drawingHistory.push(step);
  
    e.preventDefault(); 
  }

  //UNDO
  function undoDraw() {
    const stepsToUndo = 5; // 

    for (let i = 0; i < stepsToUndo; i++) {
      if (drawingHistory.length > 0) {
        drawingHistory.pop();
      }
    }

    if (drawingHistory.length > 0) {
      const lastStep = drawingHistory[drawingHistory.length - 1];
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.putImageData(lastStep.data, 0, 0);
    } else {
      clearCanvas();
    }
  }

  function clearCanvas() {
    context.fillRect(0, 0, canvas.width, canvas.height);
    const step = {
      type: "clear",
      data: context.getImageData(0, 0, canvas.width, canvas.height),
    };
    drawingHistory = [step];
  }

  function addText(e) {
    if (!isAddingText) return;

    const text = textInput.value.substr(0, 100);
    const maxWidth = canvas.width - (e.clientX - canvas.getBoundingClientRect().left);

    context.font = `${fontSize}px 'Open Sans', sans-serif`;
    context.fillStyle = strokeColor;

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      var words = text.split(' ');
      var line = '';

      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + '';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        }
        else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
    }

    const lineHeight = fontSize * 1.2;
    wrapText(context, text, e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top, maxWidth, lineHeight);

    const step = {
      type: "text",
      data: context.getImageData(0, 0, canvas.width, canvas.height),
    };
    drawingHistory.push(step);

    isAddingText = false;
    addTextButton.innerText = "Add Text";
    textInput.value = "";

    commentInput.addEventListener('input', () => {
      const inputLength = commentInput.value.length;
      characterCount.textContent = `${inputLength} / 500`;

      // Rajoita kommentin pituus 500 merkkiin
      if (inputLength > 500) {
        commentInput.value = commentInput.value.substring(0, 50);
        characterCount.textContent = '50 / 50';
      }
    });
  }

  const uploadButton = document.getElementById("uploadButton");
  uploadButton.addEventListener("click", function () {
    saveCanvasToFirebase();
  });

  function saveCanvasToFirebase() {
    if (drawingHistory.length < 150) {
        alert("Not enough content. Please draw something more before saving.");
        return;
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "taidekuva.png";

    // Luo Blob-objekti ja tallenna se Firebaseen
    const blob = dataURItoBlob(canvas.toDataURL("image/png"));
    const storageRef = firebase.storage().ref();
    const imageName = `taidekuva_${new Date().getTime()}.png`;
    const imageRef = storageRef.child(imageName);

    // Tallenna kuva Firebase Storageen
    imageRef.put(blob).then(function (snapshot) {
        console.log("Kuva ladattu Firebaseen onnistuneesti!");

        // Haetaan kuvalle URL Firebase Storagesta
        imageRef.getDownloadURL().then(function (imageUrl) {
            // Tallenna kuvan metatiedot Firebaseen
            const metadata = {
                timestamp: firebase.database.ServerValue.TIMESTAMP, // Lisätään luontiaika
                url: imageUrl
            };
            firebase.database().ref('images').push(metadata).then(function () {
                console.log("Kuvan metatiedot tallennettu Firebaseen onnistuneesti!");

                // Uudelleenohjaa käyttäjä sivulle tykatyimmat.html
                window.location.href = "tykatyimmat.html";
            }).catch(function (error) {
                console.error("Virhe kuvan metatietojen tallentamisessa Firebaseen:", error);
            });
        }).catch(function (error) {
            console.error("Virhe kuvan URL:n hakemisessa Firebase Storagesta:", error);
        });
    }).catch(function (error) {
        console.error("Virhe kuvan lataamisessa Firebaseen:", error);
    });
}

// Apufunktio: Muuntaa data-URL Blob-objektiksi
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}

// Muut koodit ja tapahtumankäsittelijät...
});
