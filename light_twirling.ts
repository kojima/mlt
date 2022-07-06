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
    PALETTE6 = 5,
    //% block="パレット7"
    PALETTE7 = 6,
    //% block="パレット8"
    PALETTE8 = 7,
    //% block="パレット9"
    PALETTE9 = 8,
    //% block="パレット10"
    PALETTE10 = 9
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
    PaletteColor6 = 5,
}

const PaletteColorColors: {[key: number]: Array<number>} = {
    0: [
        NeoPixelColorsPlus.None,
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
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    2: [
        NeoPixelColorsPlus.None,
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
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    4: [
        NeoPixelColorsPlus.None,
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
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    6: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    7: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    8: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ],
    9: [
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None,
        NeoPixelColorsPlus.None
    ]
};

let mltStrip1: neopixel.Strip = neopixel.create(DigitalPin.P0, 6, NeoPixelMode.RGB)

let currentPalette: Palette = Palette.PALETTE1
let currentPaletteColor: PaletteColor = null

let receivedTimestamps: number[] = [];

/**
 * ライトトワリング
 */
//% weight=100 color=#e67e22 icon="\uf005" block="ライトトワリング"
namespace light_twirling {

    input.onButtonPressed(Button.A, function () {
        if (remoteControlled) return;

        if (currentPaletteColor === null) currentPaletteColor = PaletteColor.PaletteColor1
        else currentPaletteColor = (currentPaletteColor + 1) % 6
        _litLED(PaletteColorColors[currentPalette][currentPaletteColor])
    })

    input.onButtonPressed(Button.B, function () {
        if (remoteControlled) return;

        if (currentPaletteColor === null) {
            currentPaletteColor = PaletteColor.PaletteColor6
        } else {
            if (currentPaletteColor <= 0) currentPaletteColor = 6
            currentPaletteColor = (currentPaletteColor - 1) % 6
        }
        _litLED(PaletteColorColors[currentPalette][currentPaletteColor])
    })

    function indicatePalette() {
        if (mode === 'switchingPalette') return
        mode = 'switchingPalette'
        const colors = [
            0xFF0000,
            0xFF6A00,
            0xFFE800,
            0x006400,
            0x55FF00,
            0x101989,
            0x0000FF,
            0x2255FF,
            0x7700FF,
            0xEE33EE,
            0xFFFFFF,            
        ]
        if (currentPalette >= 0 && currentPalette < colors.length) {
            for (let i = 0; i < 3; i++) {
                _turnOffLED()
                basic.pause(250)
                _litLED(colors[currentPalette])
                basic.pause(250)
            }
            _turnOffLED()
        }
        mode = "AlwaysON"
    }

    input.onButtonPressed(Button.AB, function () {
        if (remoteControlled) return;

        currentPalette = (currentPalette + 1) % 10
        indicatePalette()
    })

    let remoteControlled = false
    radio.onReceivedValue(function (name, valueWithTimestamp: number) {
        //serial.writeLine("onReceivedValue")
        //serial.writeValue(name, valueWithTimestamp)
        const timestamp: number = Math.floor(valueWithTimestamp / 10000)
        const value = valueWithTimestamp - timestamp * 10000

        if (receivedTimestamps.indexOf(timestamp) >= 0) return;

        //serial.writeValue(name, value)
        receivedTimestamps.push(timestamp)
        if (receivedTimestamps.length > 100) receivedTimestamps.shift()

        // *********************************************
        // repeat message for other twirling toarches
        // *********************************************
        radio.sendValue(name, valueWithTimestamp)

        if (name == "mode") {
            if (value === 1) mode = 'AlwaysON'
            else if (value === 2) mode = 'Blink'
            _litLED(PaletteColorColors[currentPalette][currentPaletteColor])
        } else if (name == "palette") {
            remoteControlled = true
            currentPalette = value
            //indicatePalette()
        } else if (name == "led") {
            remoteControlled = true
            currentPalette = Math.floor(value / 10.0) | 0
            currentPaletteColor = value - currentPalette * 10
            if (mode === 'AlwaysON') _litLED(PaletteColorColors[currentPalette][currentPaletteColor])
        } else if (mode == "Blink" && name == "blink") {
            if (value == 1) {
                _litLED(PaletteColorColors[currentPalette][currentPaletteColor])
            } else {
                _turnOffLED()
            }
        }
    })

    let bpm = 0
    let mode = "AlwaysON"
    radio.setGroup(1)
    _turnOffLED()
    basic.forever(function () {
        if (mode === 'switchingPalette') return
        if (mode == "AlwaysON" && currentPaletteColor !== null) {
            _litLED(PaletteColorColors[currentPalette][currentPaletteColor])
        }
    })

    /**
     * カラーを指定した色に設定します
    */
    //% block="$Palette の$PaletteColor を%color=neo_pixel_colors_plus|にする"
    //% weight=100
    export function setPaletteColorColor(Palette: Palette, PaletteColor: PaletteColor, color: number): void {
        PaletteColorColors[Palette][PaletteColor] = color
    }

    function _litLED(color: number): void {
        if (color === NeoPixelColorsPlus.None) {
            _turnOffLED()
        } else {
            mltStrip1.showColor(color)
        }
    }

    function _setPixelColor(offset: number, color: number): void {
        if (color === null) {
            mltStrip1.buf.fill(0, offset * 3, 3)
        } else {
            mltStrip1.setPixelColor(offset, color)
            mltStrip1.show()
        }
    }

    function _litLEDWithColors(color1: number, color2: number, color3: number): void {
        _setPixelColor(0, color1)
        _setPixelColor(1, color2)
        _setPixelColor(2, color3)
        mltStrip1.show()
    }

    function _turnOffLED(): void {
        mltStrip1.clear()
        mltStrip1.show()
    }


   /**
     * LEDの色を選択します
    */
    //% blockId="neo_pixel_colors_plus" block="%color"
    //% weight=90
    export function colors(color: NeoPixelColorsPlus): number {
        return color
    }

    /**
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
}