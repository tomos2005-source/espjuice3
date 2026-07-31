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
        switch (type) {
            case SensorType.T1: cmd = "EJ GETKIO"; break;
            case SensorType.T2: cmd = "EJ GETONDO"; break;
            case SensorType.Hum: cmd = "EJ GETSHITSU"; break;
            case SensorType.Pres: cmd = "EJ GETKIATSU"; break;
            case SensorType.Lux: cmd = "EJ GETLUX"; break;
            case SensorType.Dist: cmd = "EJ GETDISTANCE"; break;
        }

        serial.readString(); // 受信バッファの掃除
        serial.writeString(cmd + "\r\n");
        basic.pause(300); // ボードの計測待ち

        let res = serial.readUntil("\n");
        // 仕様に基づく単一のシングルクォート除去
        return res.replace("'", "").replace("\r", "").trim();
    }

    /**
     * ボード上のメモリに一時的な値を保存します。
     */
    //% group="値の一時設定"
    //% block="一時的な値を設定: $type を $value にする"
    //% weight=90
    export function setTempData(type: SensorType, value: number): void {
        let cmd = "";
        switch (type) {
            case SensorType.T1: cmd = "EJ SETKIO"; break;
            case SensorType.T2: cmd = "EJ SETONDO"; break;
            case SensorType.Hum: cmd = "EJ SETSHITSU"; break;
            case SensorType.Pres: cmd = "EJ SETKIATSU"; break;
            case SensorType.Lux: cmd = "EJ SETLUX"; break;
            case SensorType.Dist: cmd = "EJ SETDISTANCE"; break;
        }
        serial.readString(); // ゴミ掃除
        serial.writeString(cmd + " " + value.toString() + "\r\n");
        basic.pause(100);
    }

    /**
     * SSIDとパスワードを個別に設定し、WiFiに接続(APC)します。
     */
    //% group="WiFi設定"
    //% block="WiFiに接続 SSID:$ssid パスワード:$pwd"
    //% weight=80
    export function connectWiFi(ssid: string, pwd: string): void {
        serial.writeString("EJ SETSSID " + ssid + "\r\n");
        basic.pause(300);
        serial.writeString("EJ SETPWD " + pwd + "\r\n");
        basic.pause(300);
        serial.writeString("EJ APC\r\n");
        basic.pause(1000);
    }

    /**
     * ThingsBoardのアクセストークンを設定します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoardトークン設定 $token"
    //% weight=50
    export function setToken(token: string): void {
        serial.readString(); // 前の通信残骸を消す
        serial.writeString("EJ SETTOKEN " + token + "\r\n");
        basic.pause(300);
    }

    /**
     * ThingsBoardへ即時送信します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoardへ即時送信"
    //% weight=40
    export function sendTB(): void {
        serial.readString();
        serial.writeString("EJ SENDTB\r\n");
        basic.pause(1000); // 送信処理は時間がかかるため長めに待機
    }

    /**
     * 自動送信の間隔を設定します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoard自動送信間隔を $sec 秒にする(0で停止)"
    //% weight=30
    export function autoSendTB(sec: number): void {
        serial.writeString("EJ SENDTB " + sec.toString() + "\r\n");
        basic.pause(200);
    }

    /**
     * WiFi接続状態、IPアドレス等の補助機能
     */
    //% group="ネットワーク情報"
    //% block="WiFi接続中？"
    //% weight=70
    export function isConnected(): boolean {
        serial.writeString("EJ APS\r\n");
        basic.pause(200);
        return serial.readString().includes("1");
    }

    /**
     * 現在のIPアドレスを取得します。
     */
    //% group="ネットワーク情報"
    //% block="IPアドレスを取得"
    //% weight=55
    export function getIP(): string {
        serial.writeString("EJ GETIP\r\n");
        basic.pause(200);
        return serial.readUntil("\n").replace("'", "").replace("\r", "").trim();
    }
}