/**
 * WiFi & Sensors Serial Board Control
 */
//% color="#2e7d32" weight=100 icon="\uf1eb" block="WiFi通信ボード"
//% groups='["センサー取得", "値の一時設定", "WiFi設定", "ThingsBoard", "ネットワーク情報"]'
namespace wifiBoard {

    export enum SensorType {
        //% block="温度1(BME280)"
        T1,
        //% block="温度2(DS18B20)"
        T2,
        //% block="湿度"
        Hum,
        //% block="気圧"
        Pres,
        //% block="照度"
        Lux,
        //% block="距離"
        Dist
    }

    /**
     * 指定したセンサーの値を数値(number)で取得します。
     */
    //% group="センサー取得"
    //% block="$type の値を数値で取得"
    //% weight=110
    export function getSensorValue(type: SensorType): number {
        let s = getSensorData(type);
        let n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    }

    /**
     * 指定したセンサーの値を文字列(string)で取得します。
     */
    //% group="センサー取得"
    //% block="$type の現在値を文字列で取得"
    //% weight=100
    export function getSensorData(type: SensorType): string {
        let cmd = "";
        let prefix = "";
        switch (type) {
            case SensorType.T1: cmd = "GETKIO"; prefix = "'T1"; break;
            case SensorType.T2: cmd = "GETKIO2"; prefix = "'T2"; break;
            case SensorType.Hum: cmd = "GETSHITSU"; prefix = "'H"; break;
            case SensorType.Pres: cmd = "GETKIATSU"; prefix = "'P"; break;
            case SensorType.Lux: cmd = "GETLUX"; prefix = "'L"; break;
            case SensorType.Dist: cmd = "GETDISTANCE"; prefix = "'D"; break;
        }

        serial.readString(); // 受信バッファを一度空にする（ゴミ取り）
        serial.writeLine(cmd);
        basic.pause(200); // 応答待ち時間を少し長めに

        let res = serial.readUntil("\n");
        return res.replace(prefix, "").trim();
    }

    /**
     * ボード上のメモリに値を保存します。
     * GETした値を別の項目に書き込まないよう、明示的にコマンドを送ります。
     */
    //% group="値の一時設定"
    //% block="一時的な値を設定: $type を $value にする"
    //% weight=90
    export function setTempData(type: SensorType, value: number): void {
        let cmd = "";
        switch (type) {
            case SensorType.T1: cmd = "SETKIO"; break;
            case SensorType.T2: cmd = "SETKIO2"; break;
            case SensorType.Hum: cmd = "SETSHITSU"; break;
            case SensorType.Pres: cmd = "SETKIATSU"; break;
            case SensorType.Lux: cmd = "SETLUX"; break;
            case SensorType.Dist: cmd = "SETDISTANCE"; break;
        }
        // コマンドと値の間に確実にスペースを入れ、数値のみを送信
        serial.writeString(cmd + " " + value.toString() + "\r\n");
        basic.pause(100);
    }

    /**
     * WiFiに接続 (SETSSID -> SETPWD -> APC)
     */
    //% group="WiFi設定"
    //% block="WiFiに接続 SSID:$ssid パスワード:$pwd"
    //% weight=80
    export function connectWiFi(ssid: string, pwd: string): void {
        serial.writeLine("SETSSID " + ssid);
        basic.pause(300);
        serial.writeLine("SETPWD " + pwd);
        basic.pause(300);
        serial.writeLine("APC");
        basic.pause(500);
    }

    // --- 以下の関数は変更なし ---

    //% group="WiFi設定"
    //% block="WiFi接続中？"
    //% weight=70
    export function isConnected(): boolean {
        serial.writeLine("APS");
        basic.pause(100);
        return serial.readString().includes("1");
    }

    //% group="WiFi設定"
    //% block="WiFiを切断"
    //% weight=60
    export function disconnectWiFi(): void {
        serial.writeLine("APD");
    }

    //% group="ネットワーク情報"
    //% block="MACアドレスを取得"
    //% weight=55
    export function getMac(): string {
        serial.writeLine("MAC");
        basic.pause(100);
        return serial.readUntil("\n").replace("'", "").trim();
    }

    //% group="ThingsBoard"
    //% block="ThingsBoardトークン設定 $token"
    //% weight=50
    export function setToken(token: string): void {
        serial.writeLine("SETTOKEN " + token);
    }

    //% group="ThingsBoard"
    //% block="ThingsBoardへ即時送信"
    //% weight=40
    export function sendTB(): void {
        serial.writeLine("SENDTB");
    }

    //% group="ThingsBoard"
    //% block="ThingsBoard自動送信間隔を $sec 秒にする(0で停止)"
    //% weight=30
    export function autoSendTB(sec: number): void {
        serial.writeLine("SENDTB " + sec);
    }
}