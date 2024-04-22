


const defaults = {
  ele: "",  
  hidenRate: 0.03,  
  letters: "123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ", // käytettävät merkit
  fallRate: 60, 
  textDir: "ltr", 
  letterSpace: 60, 
  isMustTop: true, 
  mode: "window", 
  linePercent: 1, 
  font_size: 100,  
  lineWidth: 20,  
  firstLetterColor: "#FFF", 
  letterColor: "#6D2", 
  width: 600,  
  height: 600 
  
  
}

class Digital {
  /**
   *C.
   * @memberof Digital
   */
  constructor(options) {
      if (!options || typeof options.ele !== "string" || options.ele.length < 1) {
          throw new Error("ele must be a valid string")
      }

      this.options = Object.assign(
          defaults, options || {});

      this.canvas = document.querySelector(this.options.ele);
      // HTMLElement
      if (!this.canvas) {
          throw new Error("ELEMENTIN PITÄÄ OLLA OSA DOMIA. OLETKO UNPLUGGANNUT?")
      }

      this.context = this.canvas.getContext("2d");

      this.drops = [];
      this.text = [];
      this._state = true;

      this.init();
  }

  init() {
    
      if (this.options.mode === "window") {
          this.canvas.style.position = "absolute";
          this.canvas.style.width = window.innerWidth + "px";
          this.canvas.style.height = window.innerHeight + "px";

          this.canvas.height = window.innerHeight;
          this.canvas.width = window.innerWidth;
      } else {
          this.canvas.height = this.options.height;
          this.canvas.width = this.options.width;
      }
      
      if (this.options.textDir === "rtl") {
          this.context.translate(this.canvas.width, 0);
          this.context.scale(-1, 1);
      }

      this.initDrops(this.canvas.width);
      this.initBackground();

      this.timmer = setInterval(this.draw.bind(this), this.options.fallRate);
  }

  initDrops(width) {
      // merkkien vektorijärjestyksen satunnaistaminen ja columnien leveys
      this._chars = this.options.letters.split('');

      var _columns = Math.ceil(width / this.options.lineWidth);

      for (let i = 0; i < _columns; i++) {
          this.drops[i] = this.options.isMustTop ? (Math.random() * this.options.letterSpace) - this.options.letterSpace : (Math.random() * this.options.letterSpace);
      }
  }
  

  

  initBackground() {
    /* Musta tausta */
    
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    /* Lisätään teksti ja viiva */
    let drawLine = true;
    const draw = () => {
      drawLine = !drawLine;
      this.context.fillStyle = drawLine ? "#6D2" : "#000";
      if (!this._state) {
        this.context.fillRect(220, 110, 5, 20);
        setTimeout(draw, 500);
      }
    }
    draw();
    /* Lisätään teksti */
    if (!this._state) {
        this.context.fillStyle = "#6D2";
        this.context.font = "20px Courier";
        const text = "Time to wake up, Neo.";
        const textWidth = this.context.measureText(text).width;
        this.context.fillText(text, 30, 100);
        this.context.fillText("Click, click...", 30, 130);
    }
  }
  

  draw() {
      this.drawRawData();

      // 
      const {
          lineWidth,
          linePercent,
          isMustTop,
          letterSpace,
          firstLetterColor
      } = this.options

      this.context.fillStyle = firstLetterColor;
      for (let i = 0; i < this.drops.length; i++) {
          this.drops[i]++;
          this.text[i] = this._chars[Math.floor(Math.random() * this._chars.length)];
          this.context.fillText(this.text[i], i * lineWidth, this.drops[i] * lineWidth);
          
          // SATUNNAISTA PUTOAMINEN!!
          
          
          if (this.drops[i] * lineWidth > this.canvas.height * linePercent) {
              this.drops[i] = isMustTop ? (Math.random() * letterSpace) - letterSpace : (Math.random() * letterSpace);
          }
      }
  }

  drawRawData() {
      const {
          lineWidth,
          hidenRate
      } = this.options;

      this.context.font = lineWidth + "px 'Consolas', 'Lucida Console'";
      this.context.fillStyle = "rgba(0, 0, 0," + hidenRate + ")";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.fillStyle = "#6D2";
      for (let i = 0; i < this.drops.length; i++) {
          this.context.fillText(this.text[i] || this._chars[Math.floor(Math.random() * this._chars.length)], i * lineWidth, this.drops[i] * lineWidth);
      }
  }

  stop() {
      this._state = false;
      
      this.initBackground();
      
      clearInterval(this.timmer);
      this.timmer = null;
      this.drops = [];
      this.text = [];
      
  }

  start() {
      this._state = true;
      this.init();
  }
 
}
