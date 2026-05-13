const RadioGroup = 1
enum NeoPixelColorsPlus {
    //% block=赤
    Red = 0xFF0000,
    //% block=オレンジ
    Orange = 0xFF6A00,
    //% block=黄
    Yellow = 0xFFE800,
    //% block=緑
    Green = 0x006400,
    //% block=黄緑
    YellowGreen = 0x55FF00,
    //% block=藍
    Indigo = 0x101989,
    //% block=青
    Blue = 0x0000FF,
    //% block=水色
    WaterBlue = 0x2255FF,
    //% block=紫
    Purple = 0x7700FF,
    //% block=ピンク
    Pink = 0xEE33EE,
    //% block=白
    White = 0xFFFFFF,
    //% block=消
    None = null
}

enum Palette {
    //% block="パレット1"
    PALETTE1 = 0,
    //% block="パレット2"
    PALETTE2 = 1,
    //% block="パレット3"
    PALETTE3 = 2,
    //% block="パレット4"
    PALETTE4 = 3,
    //% block="パレット5"
    PALETTE5 = 4,
    //% block="パレット6"
    PALETTE6 = 5
}

enum PaletteColor {
    //% block="カラー1"
    PaletteColor1 = 0,
    //% block="カラー2"
    PaletteColor2 = 1,
    //% block="カラー3"
    PaletteColor3 = 2,
    //% block="カラー4"
    PaletteColor4 = 3,
    //% block="カラー5"
    PaletteColor5 = 4,
    //% block="カラー6"
    PaletteColor6 = 5
}

const PaletteColorColors: {[key: number]: Array<number>} = {
    0: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    1: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    2: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    3: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    4: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    5: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ]
};

type ReservedPacket = {
    timestamp: number,
    name: string,
    value: number,
}

/*
 * ライトトワリング
 */
//% weight=100 color=#e67e22 icon="\uf005" block="ライトトワリング"
namespace light_twirling {
    let mltStrip1: neopixel.Strip = neopixel.create(DigitalPin.P0, 6, NeoPixelMode.RGB)

    let currentPalette: Palette = Palette.PALETTE1
    let currentPaletteColor: PaletteColor = null
    let lastLedValue: number | null = null

    const ModeAlwaysOn = 1
    const ModeBlink = 2
    let currentMode = ModeAlwaysOn

    let latestSerialNo = 0

    let subTorchAddress: number | null = null;

    let remoteControlled = false

    const paletteLen = Object.keys(PaletteColorColors).length
    const colorLen = PaletteColorColors[0].length

    let reservedPacket: ReservedPacket | null = null;

    _loadPaletteColorsFromNVS();

    radio.setGroup(RadioGroup)
    radio.setTransmitPower(7)
    _turnOffLed()

    let _isColorPlotted = false;
    const _plotColor = (color: number) => {
        for (let i = 0; i < 6; i++) {
            const x = i % 5
            const y = Math.floor(i / 5) + 2
            if (i !== color) led.unplot(x, y)
            else led.plot(x, y)
        }
        _isColorPlotted = true;
    }

    let _isPalettePlotted = false;
    const _plotPalette = (palette: number) => {
        for (let i = 0; i < 6; i++) {
            const x = i % 5
            const y = Math.floor(i / 5)
            if (i !== palette) led.unplot(x, y)
            else led.plot(x, y)
        }
        _isPalettePlotted = true;
    }

    function _litLed(color: number): void {
        if (color === NeoPixelColorsPlus.None) {
            _turnOffLed()
        } else {
            mltStrip1.showColor(color)
        }
        if (!remoteControlled) {
            basic.clearScreen()
            _plotPalette(currentPalette)
            _plotColor(currentPaletteColor)
        }
    }

    function _turnOffLed(): void {
        mltStrip1.clear()
        mltStrip1.show()
    }

    function _setRemoteControlled(value: boolean): void {
        if (!remoteControlled && value) {
            basic.clearScreen()
            _plotPalette(-1)
            _plotColor(-1)
        }
        remoteControlled = value
    }

    const _sendPaletteToSubTorch = () => {
        for (let i = 0; i < paletteLen * colorLen; i++) {
            const buf = Buffer.create(6)
            buf.fill(subTorchAddress, 0, 1)
            buf.fill(0xFF, 1, 1) // type
            buf.fill(i, 2, 1) // serial color index
            const paletteIndex = Math.floor(i / colorLen)
            const colorIndex = i % colorLen
            const rgb = PaletteColorColors[paletteIndex][colorIndex]
            if (rgb === NeoPixelColorsPlus.None) continue

            const r = (rgb & 0xFF0000) >> 16
            const g = (rgb & 0x00FF00) >> 8
            const b = rgb & 0x0000FF
            buf.fill(r, 3, 1)    // r of rgb
            buf.fill(g, 4, 1)    // g of rgb
            buf.fill(b, 5, 1)    // b of rgb
            radio.sendBuffer(buf)
        }
    }

    control.setInterval(() => {
        _sendPaletteToSubTorch()
    }, 1000, control.IntervalMode.Timeout)

    function _sendPacketToSubTorch() {
        if (!remoteControlled && subTorchAddress) {
            const buf = Buffer.create(6)
            buf.fill(subTorchAddress, 0, 1)
            buf.fill(0xEE, 1, 1) // type
            buf.fill(currentPalette, 2, 1) // palette
            buf.fill(currentPaletteColor, 3, 1) // color
            radio.sendBuffer(buf)
            control.setInterval(() => {
                _sendPaletteToSubTorch()
            }, 1000, control.IntervalMode.Timeout)
        }
    }

    input.onButtonPressed(Button.A, function () {
        if (remoteControlled) return;

        if (currentPaletteColor === null) {
            currentPaletteColor = PaletteColor.PaletteColor1
        } else {
            currentPaletteColor = (currentPaletteColor + 1) % colorLen
        }
        _litLed(PaletteColorColors[currentPalette][currentPaletteColor])
        _sendPacketToSubTorch()
    })

    input.onButtonPressed(Button.B, function () {
        if (remoteControlled) return;

        if (currentPaletteColor === null) {
            currentPaletteColor = PaletteColor.PaletteColor6
        } else {
            if (currentPaletteColor <= 0) currentPaletteColor = colorLen
            currentPaletteColor = (currentPaletteColor - 1) % colorLen
        }
        _litLed(PaletteColorColors[currentPalette][currentPaletteColor])
        _sendPacketToSubTorch()
    })

    radio.onReceivedValue(function (name, valueWithSerialNo: number) {
        if (name === "init") {
            latestSerialNo = 0
            currentMode = ModeAlwaysOn
            _turnOffLed()
            return
        }
        const serialNo: number = Math.floor(valueWithSerialNo / 100)
        const value = valueWithSerialNo % 100

        // discard an old packets
        if (serialNo <= latestSerialNo) {
            return
        }

        latestSerialNo = serialNo
        reservedPacket = null;

        //serial.writeValue(name, value)

        if (name === "mode") {
            currentMode = value
            if (currentMode == ModeAlwaysOn) {
                _litLed(PaletteColorColors[currentPalette][currentPaletteColor])
            }
        } else if (name === "led") {
            _setRemoteControlled(true)
            if (lastLedValue === value) return;
            lastLedValue = value;
            currentPalette = Math.floor(value / 10.0) | 0
            currentPaletteColor = value - currentPalette * 10
            if (currentMode === ModeAlwaysOn) {
                if (currentPalette < colorLen) {
                    _litLed(PaletteColorColors[currentPalette][currentPaletteColor])
                } else {
                    _turnOffLed()
                }
            }
            // *********************************************
            // reserve message packet
            // *********************************************
            reservedPacket = {
                timestamp: control.millis(),
                name: name,
                value: valueWithSerialNo
            }
        } else if (name === "blink") {
            if (value === 1) {
                _litLed(PaletteColorColors[currentPalette][currentPaletteColor])
            } else {
                _turnOffLed()
            }
        }
    })

    /*
     * カラーを指定した色に設定します
     */
    //% block="$palette の$paletteColor を$color=customColorNumberPicker にする"
    //% weight=100
    export function setPaletteColorColor(palette: Palette, paletteColor: PaletteColor, color: number): void {
        if (!color && color !== 0x000000 && color !== NeoPixelColorsPlus.None) return
        PaletteColorColors[palette][paletteColor] = color

        // set the last designated palette as a current palette.
        currentPalette = palette
    }

    /**
     * パレットからLEDの色を選択します
     */
    //  Reference: https://github.com/KitronikLtd/pxt-kitronik-klip-motor/blob/afd0fb5f093dfa9a109c0b4c5a9838899744e86a/klip_motor.ts#L549
    //% blockId=customColorNumberPicker block="%value"
    //% weight=90
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% value.defl='#ff0000'
    //% value.fieldOptions.colours='["#FF0000", "#FF2B00", "#FF5500", "#FF8000", "#FFAA00", "#FFD500", "#FFFF00", "#D5FF00", "#AAFF00", "#80FF00", "#55FF00", "#2BFF00", "#00FF00", "#00FF2B", "#00FF55", "#00FF80", "#00FFAA", "#00FFD5", "#00FFFF", "#00D5FF", "#00AAFF", "#0080FF", "#0055FF", "#002BFF", "#0000FF", "#2B00FF", "#5500FF", "#8000FF", "#AA00FF", "#D500FF", "#FF00FF", "#FF00D5", "#FF00AA", "#FF0080", "#FF0055", "#FF002B", "#FFFFFF", "#000000"]'
    //% value.fieldOptions.columns=6 value.fieldOptions.className='rgbColorPicker'
    export function __colorNumberPicker(value: number) {
        return value;
    }

    /*
     * LEDの色を選択します
     */
    //% blockId="neo_pixel_colors_plus" block="%color"
    //% weight=85
    export function colors(color: NeoPixelColorsPlus): number {
        return color
    }

    /*
     * カラーコード(#FF00FFのようなコード)を色に変換します
     */
    //% block="カラーコード%colorCode|を色に変換"
    //% weight=80
    export function convertColorCode(colorCode: string): number {
        let sanitized = false
        while (!sanitized) {
            if (colorCode.length > 0 && (colorCode[0] === '#' || colorCode[0] === ' ')) {
                colorCode = colorCode.slice(1)
            } else {
                sanitized = true
            }
        }
        return parseInt(colorCode, 16)
    }

    /*
     * サブトーチのアドレスを設定します
     */
    //% block="サブトーチのアドレスを%address|にする"
    //% address.defl=1
    //% weight=70
    export function setSubTorchAddress(address: number): void {
        if (address > 255) return

        subTorchAddress = address
    }

    let _isKeepABPressed: boolean | null = null;
    let _buttonPressedFrom = 0;
    basic.forever(() => {
        if (remoteControlled) {
            // send reservedPacket if needed
            if (reservedPacket) {
                const current = control.millis()
                const randomInterval = 50 + 50 * Math.random()
                if (current - reservedPacket.timestamp >= randomInterval) {
                    radio.sendValue(
                        reservedPacket.name,
                        reservedPacket.value
                    )
                    reservedPacket = null;
                }
            }
            return;
        }

        // Detect long AB button pressed state for saving palette colors
        if (input.buttonIsPressed(Button.AB) && _isKeepABPressed === null) {
            _isKeepABPressed = true;
            _buttonPressedFrom = control.millis();
        } else if (_isKeepABPressed) {
            // After keeping the state of AB button pressed for 3 seconds,
            // save the palette colors to NVS
            if (input.buttonIsPressed(Button.AB) && control.millis() - _buttonPressedFrom >= 3000) {
                _savePaletteColorsToNvs();
                music._playDefaultBackground(music.builtInPlayableMelody(Melodies.BaDing), music.PlaybackMode.InBackground);
                basic.showIcon(IconNames.Yes);
                basic.pause(1000)
                basic.clearScreen();
                _isPalettePlotted && _plotPalette(currentPalette);
                _isColorPlotted && _plotColor(currentPaletteColor);
                _isKeepABPressed = false;
            // Clicking the AB button means changing the color palette
            } else if (!input.buttonIsPressed(Button.AB)) {
                currentPalette = (currentPalette + 1) % paletteLen;
                basic.clearScreen();
                _plotPalette(currentPalette);
                _plotColor(currentPaletteColor);
                _isKeepABPressed = false;
            }
        } else if (_isKeepABPressed === false && !input.buttonIsPressed(Button.AB)) {
            _isKeepABPressed = null;
        }
    });

    // RGB (3 bytes) x # of colors x # of palettes
    function _savePaletteColorsToNvs(): void {
        for (let i = 0; i < paletteLen; i++) {
            if (PaletteColorColors[i].reduce((sum, color) => sum + color, 0) === 0) {
                continue;
            } else {
                const colorBuffer: Buffer = pins.createBuffer(3 * colorLen);
                for (let j = 0; j < colorLen; j++) {
                    const color = PaletteColorColors[i][j];
                    const r = (color & 0xFF0000) >> 16;
                    const g = (color & 0x00FF00) >> 8;
                    const b = (color & 0x0000FF);
                    colorBuffer.setNumber(NumberFormat.UInt8BE, j * 3 + 0, r);
                    colorBuffer.setNumber(NumberFormat.UInt8BE, j * 3 + 1, g);
                    colorBuffer.setNumber(NumberFormat.UInt8BE, j * 3 + 2, b);
                    //serial.writeString(`${i}${j}:${r},${g},${b}\n`);
                }
                nvs.putBuffer(`${i}`, colorBuffer);
            }
        }
        //serial.writeString('-----\n');
    }

    function _loadPaletteColorsFromNVS(): void {
        for (let i = 0; i < paletteLen; i++) {
            const colors: number[] = [];
            const colorBuffer = nvs.getBuffer(`${i}`, 3 * colorLen);

            if (typeof colorBuffer === 'number') return;

            for (let j = 0; j < colorLen; j++) {
                const r = colorBuffer.getNumber(NumberFormat.UInt8BE, j * 3 + 0);
                const g = colorBuffer.getNumber(NumberFormat.UInt8BE, j * 3 + 1);
                const b = colorBuffer.getNumber(NumberFormat.UInt8BE, j * 3 + 2);
                //serial.writeString(`${i}${j}:${r},${g},${b}\n`);
                PaletteColorColors[i][j] = (r << 16) | (g << 8) | b;
            }
        }
    }
}