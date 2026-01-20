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

        // 1. バッファの掃除（重要：前の残りを消す）
        serial.readString();

        // 2. コマンド送信
        serial.writeString(cmd + "\r\n");

        // 3. 待ち時間（ボードがセンサーを読んで返信する時間）
        basic.pause(300);

        // 4. 行末まで読み取り
        let res = serial.readUntil("\n");

        // 5. 接頭辞の削除とクリーニング
        let cleaned = res.replace(prefix, "").replace("\r", "").trim();
        return cleaned;
    }

    /**
     * ボード上のメモリに値を保存します。
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

        // バッファをクリアしてから送信
        serial.readString();
        serial.writeString(cmd + " " + value.toString() + "\r\n");

        // ボード側が保存処理を終えるのを待つ
        basic.pause(200);
    }

    /**
     * WiFiに接続
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
        basic.pause(1000); // 接続開始には長めの待ち
    }

    // --- ThingsBoard 関連 ---

    /**
     * ThingsBoardへ即時送信します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoardへ即時送信"
    //% weight=40
    export function sendTB(): void {
        serial.readString(); // 送信前にゴミ掃除
        serial.writeString("SENDTB\r\n");
        basic.pause(1000); // 通信処理のため長めに待機
    }

    // 以下の関数は既存のまま
    //% group="WiFi設定"
    //% block="WiFi接続中？"
    //% weight=70
    export function isConnected(): boolean {
        serial.writeString("APS\r\n");
        basic.pause(200);
        return serial.readString().includes("1");
    }

    //% group="WiFi設定"
    //% block="WiFiを切断"
    //% weight=60
    export function disconnectWiFi(): void {
        serial.writeString("APD\r\n");
        basic.pause(300);
    }
}