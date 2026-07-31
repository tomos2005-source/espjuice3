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

        serial.readString(); // 受信バッファの掃除
        serial.writeString(cmd + "\r\n");
        basic.pause(300); // ボードの計測待ち

        let res = serial.readUntil("\n");
        return res.replace(prefix, "").replace("\r", "").trim();
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
            case SensorType.T1: cmd = "SETKIO"; break;
            case SensorType.T2: cmd = "SETKIO2"; break;
            case SensorType.Hum: cmd = "SETSHITSU"; break;
            case SensorType.Pres: cmd = "SETKIATSU"; break;
            case SensorType.Lux: cmd = "SETLUX"; break;
            case SensorType.Dist: cmd = "SETDISTANCE"; break;
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
        serial.writeString("SETSSID " + ssid + "\r\n");
        basic.pause(300);
        serial.writeString("SETPWD " + pwd + "\r\n");
        basic.pause(300);
        serial.writeString("APC\r\n");
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
        serial.writeString("SETTOKEN " + token + "\r\n");
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
        serial.writeString("SENDTB\r\n");
        basic.pause(1000); // 送信処理は時間がかかるため長めに待機
    }

    /**
     * 自動送信の間隔を設定します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoard自動送信間隔を $sec 秒にする(0で停止)"
    //% weight=30
    export function autoSendTB(sec: number): void {
        serial.writeString("SENDTB " + sec.toString() + "\r\n");
        basic.pause(200);
    }

    /**
     * WiFi接続状態、MACアドレス等の補助機能
     */
    //% group="ネットワーク情報"
    //% block="WiFi接続中？"
    //% weight=70
    export function isConnected(): boolean {
        serial.writeString("APS\r\n");
        basic.pause(200);
        return serial.readString().includes("1");
    }

    //% group="ネットワーク情報"
    //% block="MACアドレスを取得"
    //% weight=55
    export function getMac(): string {
        serial.writeString("MAC\r\n");
        basic.pause(200);
        return serial.readUntil("\n").replace("'", "").replace("\r", "").trim();
    }
}