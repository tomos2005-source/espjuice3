/**
 * WiFi & Sensors Serial Board Control
 * シリアルの初期化は標準ブロックの「シリアル通信をリダイレクトする」を使用してください。
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
     * 指定したセンサーの値を数値(number)に変換して取得します。
     * 計算や比較（～より大きいなど）に使用できます。
     */
    //% group="センサー取得"
    //% block="$type の値を数値で取得"
    //% weight=110
    export function getSensorValue(type: SensorType): number {
        let s = getSensorData(type);
        let n = parseFloat(s);
        // 変換失敗（数値でない場合）は0を返す
        if (isNaN(n)) {
            return 0;
        }
        return n;
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
            case SensorType.T2: cmd = "GETONDO"; prefix = "'T2"; break;
            case SensorType.Hum: cmd = "GETSHITSU"; prefix = "'H"; break;
            case SensorType.Pres: cmd = "GETKIATSU"; prefix = "'P"; break;
            case SensorType.Lux: cmd = "GETLUX"; prefix = "'L"; break;
            case SensorType.Dist: cmd = "GETDISTANCE"; prefix = "'D"; break;
        }
        serial.writeLine(cmd);
        basic.pause(100);
        let res = serial.readUntil("\n");
        // 接頭辞（'T1等）を取り除き、余計な空白をカット
        return res.replace(prefix, "").trim();
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
            case SensorType.T2: cmd = "SETONDO"; break;
            case SensorType.Hum: cmd = "SETSHITSU"; break;
            case SensorType.Pres: cmd = "SETKIATSU"; break;
            case SensorType.Lux: cmd = "SETLUX"; break;
            case SensorType.Dist: cmd = "SETDISTANCE"; break;
        }
        serial.writeLine(cmd + " " + value);
    }

    /**
     * SSIDとパスワードを個別に設定し、WiFiに接続(APC)します。
     */
    //% group="WiFi設定"
    //% block="WiFiに接続 SSID:$ssid パスワード:$pwd"
    //% weight=80
    export function connectWiFi(ssid: string, pwd: string): void {
        // 1. SSIDの設定
        serial.writeLine("SETSSID " + ssid);
        basic.pause(200);

        // 2. パスワードの設定
        serial.writeLine("SETPWD " + pwd);
        basic.pause(200);

        // 3. 接続実行
        serial.writeLine("APC");
        basic.pause(500);
    }

    /**
     * WiFiの接続状態を確認します（接続済なら真）。
     */
    //% group="WiFi設定"
    //% block="WiFi接続中？"
    //% weight=70
    export function isConnected(): boolean {
        serial.writeLine("APS");
        basic.pause(100);
        let res = serial.readString();
        return res.includes("1");
    }

    /**
     * WiFiを切断します。
     */
    //% group="WiFi設定"
    //% block="WiFiを切断"
    //% weight=60
    export function disconnectWiFi(): void {
        serial.writeLine("APD");
    }

    /**
     * MACアドレスを取得します。
     */
    //% group="ネットワーク情報"
    //% block="MACアドレスを取得"
    //% weight=55
    export function getMac(): string {
        serial.writeLine("MAC");
        basic.pause(100);
        return serial.readUntil("\n").replace("'", "").trim();
    }

    /**
     * ThingsBoardのアクセストークンを設定します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoardトークン設定 $token"
    //% weight=50
    export function setToken(token: string): void {
        serial.writeLine("SETTOKEN " + token);
    }

    /**
     * ThingsBoardへ即時送信します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoardへ即時送信"
    //% weight=40
    export function sendTB(): void {
        serial.writeLine("SENDTB");
    }

    /**
     * 自動送信の間隔を設定します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoard自動送信間隔を $sec 秒にする(0で停止)"
    //% weight=30
    export function autoSendTB(sec: number): void {
        serial.writeLine("SENDTB " + sec);
    }
}