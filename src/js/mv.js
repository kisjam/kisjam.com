
class ParticalNetwork {
  constructor() {

    this._canvas = document.getElementById('js-mv');
    this._canvas.width = window.innerWidth;
  	this._canvas.height = window.innerHeight;
    this._ctx = this._canvas.getContext('2d');
    this._lasttime = Date.now();
    this._balls = [];
    this._color = {
  		bg: '#FFFCF9',
  		stroke: '#55D6BE'
  	}

  }
  start() {
    for (var i = 0; i < this._canvas.width * this._canvas.height / (100 * 100); i++) {
  		this._balls.push(new this.Ball(this._canvas.width, this._canvas.height, this._canvas, this._ctx));
  	}
    const _loop = () => {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._update();
      this._draw();
      requestAnimationFrame(_loop);
    }
    _loop();

    const _resize = () => {
      this._canvas.width = window.innerWidth;
    	this._canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', _resize);

  }

  Ball(width, height, canvas, ctx) {
    let _rangeLayer = 4;
    let _arrVel = [0.05, 0.1, 0.15, 0.2];
    let _arrSize = [2, 3, 4, 5];
    let _arrAlpha = [0.3, 0.5, 0.7, 0.9];
    const _tau = Math.PI * 2;

    this._x = Math.random() * width;
    this._y = Math.random() * height;
    this._layer = Math.floor( Math.random() * _rangeLayer );
    this._size = _arrSize[ this._layer ];
    this._alpha = _arrAlpha[ this._layer ];
    this._vel = {
      x: 0,
      y: _arrVel[ this._layer ]
    }
    this._color = '#55D6BE';
    this._update = function() {
      if (this._y < -50) {
        this._y = canvas.height + 50;
      }

      this._y -= this._vel.y;
    };
    this._draw = function() {
      ctx.beginPath();
      ctx.fillStyle = this._color;
      ctx.globalAlpha = this._alpha;
      ctx.arc((0.5 + this._x) | 0, (0.5 + this._y) | 0, this._size, 0, _tau, false);
      ctx.fill();

    };
  }
  _update() {
    let _diff = Date.now() - this._lasttime;
    for (var i = 0; i * 16.6667 < _diff; i++) {
      for (var k = 0; k < this._balls.length; k++) {
        this._balls[k]._update();
      }
    }
    this._lasttime = Date.now();
  }
  _draw() {
    this._ctx.globalAlpha = 1;
    this._ctx.fillStyle = this._color.bg;
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

    for (var i = 0;i < this._balls.length; i++) {
      let _ball = this._balls[i];
      _ball._draw(this._ctx, this._canvas);
      this._ctx.beginPath();

      for (var k = this._balls.length - 1; k > i; k--) {
        let _ball2 = this._balls[k];
        let _dist = Math.hypot(_ball._x - _ball2._x, _ball._y - _ball2._y);

        if (_dist < 100) {
          this._ctx.strokeStyle = this._color.stroke;
          this._ctx.globalAlpha = 0.2;
          this._ctx.moveTo((0.5 + _ball._x) | 0, (0.5 + _ball._y) | 0);
          this._ctx.lineTo((0.5 + _ball2._x) | 0, (0.5 + _ball2._y) | 0);
        }
      }
      this._ctx.stroke();
    }
  }


}
const mv = new ParticalNetwork();
mv.start();
