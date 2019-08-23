class Image {
  constructor(width, height, data) {
    this.width = width
    this.height = height
    this.data = data
  }

  scan(x, y, w, h, f) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    for (let _y = y; _y < y + h; _y++) {
      for (let _x = x; _x < x + w; _x++) {
        const idx = (this.width * _y + _x) << 2;
        f.call(this, _x, _y, idx);
      }
    }

    return this
  }

  applyKernel(kernel, x, y) {

    const value = [0, 0, 0, 255];
    const size = (kernel.length - 1) / 2;

    for (let kx = 0; kx < kernel.length; kx += 1) {
      for (let ky = 0; ky < kernel[kx].length; ky += 1) {
        const idx = this.getPixelIndex(x + kx - size, y + ky - size);

        value[0] += this.data[idx] * kernel[kx][ky];
        value[1] += this.data[idx + 1] * kernel[kx][ky];
        value[2] += this.data[idx + 2] * kernel[kx][ky];
      }
    }
    return value;
  }

  getPixelIndex(x, y) {
    // round input
    x = Math.round(x);
    y = Math.round(y);
    let xi = x;
    let yi = y;


    if (x < 0) xi = 0;
    if (x >= this.width) xi = this.width - 1;
    if (y < 0) yi = 0;
    if (y >= this.height) yi = this.height - 1;

    return (this.width * yi + xi) << 2;
  }

  clone() {
    return new Image(this.width, this.height, this.data.slice())
  }

  pixelate(size) {
    const kernel = [
      [1 / 16, 2 / 16, 1 / 16],
      [2 / 16, 4 / 16, 2 / 16],
      [1 / 16, 2 / 16, 1 / 16]
    ];

    const copy = this.clone()
    this.scan(0, 0, this.width, this.height, function (xx, yx, idx) {
      xx = size * Math.floor(xx / size);
      yx = size * Math.floor(yx / size);

      const value = copy.applyKernel(kernel, xx, yx);
      this.data[idx] = value[0]
      this.data[idx + 1] = value[1]
      this.data[idx + 2] = value[2]
      this.data[idx + 3] = value[3]
    })
    return this
  }

  sepia() {
    this.scan(0, 0, this.width, this.height, function(xx, yx, idx){
      let red = this.data[idx]
      let green = this.data[idx + 1]
      let blue = this.data[idx + 2]
      let alpha = this.data[idx + 3]

      red = red * 0.393 + green * 0.769 + blue * 0.189
      green = red * 0.349 + green * 0.686 + blue * 0.168
      blue = red * 0.272 + green * 0.534 + blue * 0.131

      this.data[idx] = Math.min(255, red)
      this.data[idx + 1] = Math.min(255, green)
      this.data[idx + 2] = Math.min(255, blue)
      this.data[idx + 3] = alpha
    })
    return this
  }

  posterize(n) {
    if (n <  2) {
      n = 2
    }

    this.scan(0, 0, this.width, this.height, function(x, y, idx) {
      this.data[idx] = Math.floor((this.data[idx] / 255) * (n-1)) / (n-1)* 255;
      this.data[idx + 1] = Math.floor((this.data[idx + 1] / 255) * (n - 1)) / (n - 1) * 255;
      this.data[idx + 2] = Math.floor((this.data[idx + 2] / 255) * (n - 1)) / (n - 1) * 255;
    })

    return this
  }

  flip() {
    const copy = this.clone() 
    this.scan(0, 0, this.width, this.height, function(x, y, idx) {
      const _x = this.width - 1 - x
      const _y = y
      const _idx = (this.width * _y + _x) << 2
      // const value = copy.data[_idx]
      this.data[idx] = copy.data[_idx]
      this.data[idx + 1] = copy.data[_idx + 1]
      this.data[idx + 2] = copy.data[_idx + 2]
      this.data[idx + 3] = copy.data[_idx + 3]
    })

    return this
  }

  grayScale() {
    this.scan(0, 0, this.width, this.height, function(x, y, idx) {
      const grey = parseInt(
        0.2126 * this.data[idx] +
        0.7152 * this.data[idx + 1] +
        0.0722 * this.data[idx + 2],
        10
      );

      this.data[idx] = grey
      this.data[idx + 1] = grey
      this.data[idx + 2] = grey

    })

    return this
  }

  bw() {
    this.scan(0, 0, this.width, this.height, function (x, y, idx) {
      const grey = (
         this.data[idx] +
        this.data[idx + 1] +
        this.data[idx + 2]
      ) / 3

      this.data[idx] = grey > 100 ? 255 : 0
      this.data[idx + 1] = grey > 100 ? 255 : 0
      this.data[idx + 2] = grey > 100 ? 255 : 0

    })

    return this
  }

}


module.exports = {
  Image
}