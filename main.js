function signInAnonymouslyAndFetchUID() {
  return new Promise((resolve, reject) => {
    firebase.auth().signInAnonymously()
      .then((userCredential) => {
        resolve(userCredential.user.uid);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

signInAnonymouslyAndFetchUID()
  .then((uid) => {
    console.log("Kirjautuminen onnistui! Käyttäjän UID:", uid);
  })
  .catch((error) => {
    console.error("Kirjautuminen epäonnistui:", error);
  });

window.onload = function() {
  if (!localStorage.getItem('termsAccepted')) {
    alert("By using this site I promise not to spread any personal information or hateful content. By clicking OK I confirm that I am not a jerk.");
    window.addEventListener('beforeunload', function() {
      localStorage.setItem('termsAccepted', 'true');
    });
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  canvas.getContext('2d', { willReadFrequently: true });
  
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let isDrawing = false;
  let isErasing = false;
  let isAddingText = false;
  let lineWidth = 5;
  let strokeColor = "#000";
  let fontSize = 20;
  let drawingHistory = [];

  const colorPicker = document.getElementById("colorPicker");
  const changeCanvasButton = document.getElementById("changeCanvas");
  const brushSize = document.getElementById("brushSize");
  const textInput = document.getElementById("textInput");
  const fontSizeInput = document.getElementById("fontSizeInput");
  const addTextButton = document.getElementById("addTextButton");
  const undoButton = document.getElementById("undoButton");

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
    addTextButton.innerText = isAddingText ? "Click Picture" : "Add Text";
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

  canvas.addEventListener("touchstart", startDrawingTouch);
  canvas.addEventListener("touchmove", drawTouch);
  canvas.addEventListener("touchend", stopDrawingTouch);

  function startDrawing(e) {
    if (isAddingText) {
      addText(e);
    } else {
      isDrawing = true;
      context.beginPath();
      context.moveTo(
        (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.getBoundingClientRect().width),
        (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.getBoundingClientRect().height)
      );
      draw(e);
    }
  }

  function draw(e) {
    if (!isDrawing || isAddingText) return;

    context.lineWidth = lineWidth;
    context.strokeStyle = isErasing ? "#ffffff" : strokeColor;

    context.lineTo(
      (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.getBoundingClientRect().width),
      (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.getBoundingClientRect().height)
    );
    context.stroke();
    context.beginPath();
    context.moveTo(
      (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.getBoundingClientRect().width),
      (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.getBoundingClientRect().height)
    );

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
      addText(e.touches[0]);
    } else {
      const rect = canvas.getBoundingClientRect();
      isDrawing = true;
      const offsetX = rect.left + window.pageXOffset;
      const offsetY = rect.top + window.pageYOffset;
      context.beginPath();
      context.moveTo(
        (e.touches[0].pageX - offsetX) * (canvas.width / rect.width),
        (e.touches[0].pageY - offsetY) * (canvas.height / rect.height)
      );
      drawTouch(e);
    }
  }

  function drawTouch(e) {
    if (!isDrawing || isAddingText) return;

    const rect = canvas.getBoundingClientRect();
    const offsetX = rect.left + window.pageXOffset;
    const offsetY = rect.top + window.pageYOffset;

    context.lineWidth = lineWidth;
    context.strokeStyle = isErasing ? "#ffffff" : strokeColor;

    context.lineTo(
      (e.touches[0].pageX - offsetX) * (canvas.width / rect.width),
      (e.touches[0].pageY - offsetY) * (canvas.height / rect.height)
    );
    context.stroke();
    context.beginPath();
    context.moveTo(
      (e.touches[0].pageX - offsetX) * (canvas.width / rect.width),
      (e.touches[0].pageY - offsetY) * (canvas.height / rect.height)
    );

    const step = {
      type: "draw",
      data: context.getImageData(0, 0, canvas.width, canvas.height),
    };
    drawingHistory.push(step);

    e.preventDefault();
  }

  function stopDrawingTouch() {
    if (isAddingText) return;
    isDrawing = false;
    context.beginPath();
  }

  function undoDraw() {
    const stepsToUndo = 5;

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

  canvas.addEventListener("mousemove", function (e) {
    if (isAddingText) {
      canvas.style.cursor = "text";
    } else {
      canvas.style.cursor = "pointer";
    }
  });

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
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
    }

    wrapText(
      context,
      text,
      (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.getBoundingClientRect().width),
      (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.getBoundingClientRect().height),
      maxWidth,
      fontSize + 5
    );

    textInput.value = "";

    const step = {
      type: "text",
      data: context.getImageData(0, 0, canvas.width, canvas.height),
    };
    drawingHistory.push(step);

    isAddingText = false;
    addTextButton.innerText = "Add Text";
  }
});

function uploadImageToFirebase(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(function(blob) {
      var storageRef = firebase.storage().ref();
      var imageRef = storageRef.child('image.png');

      var uploadTask = imageRef.put(blob);

      uploadTask.on('state_changed', 
        function(snapshot) {
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        }, function(error) {
          reject(error);
        }, function() {
          uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            resolve(downloadURL);
          });
        }
      );
    }, 'image/png');
  });
}

function saveImage() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  // Tarkista, että canvaksessa on sisältöä
  if (!context.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0)) {
    alert("Not enough content to save.");
    return;
  }

  uploadImageToFirebase(canvas)
    .then((downloadURL) => {
      console.log('Image available at', downloadURL);
    })
    .catch((error) => {
      console.error('Error uploading image:', error);
    });
}
