/**
 * WiFi & Sensors Serial Board Control
 */
//% color="#2e7d32" weight=100 icon="\uf1eb" block="WiFi通信ボード"
//% groups='["センサー取得", "値の一時設定", "補正オフセット", "WiFi設定", "ネットワーク情報", "ThingsBoard", "キュー管理", "RTC時刻", "LED制御", "OLED制御"]'
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

    export enum OffsetType {
        //% block="気温"
        Temp,
        //% block="湿度"
        Hum,
        //% block="気圧"
        Pres,
        //% block="高度"
        Alt
    }

    export enum LedColor {
        //% block="赤"
        Red,
        //% block="黄"
        Yellow,
        //% block="青"
        Blue
    }

    export enum QueueStore {
        //% block="LittleFS"
        LittleFS,
        //% block="RAM"
        RAM
    }

    export enum OledFont {
        //% block="5x7"
        Font0 = 0,
        //% block="6x12"
        Font1 = 1,
        //% block="8x13(標準)"
        Font2 = 2,
        //% block="9x15"
        Font3 = 3,
        //% block="10x20"
        Font4 = 4
    }

    // ============================================
    // センサー取得
    // ============================================

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
        return sendCommandWithResponse(cmd, 300);
    }

    // ============================================
    // 値の一時設定
    // ============================================

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
            case SensorType.Dist: cmd = "EJ SETDIST"; break; // 仕様書に合わせ SETDIST に修正
        }
        sendCommand(cmd + " " + value.toString(), 100);
    }

    /**
     * 現在のセンサー値をすべてキャッシュ（上書き）します。
     */
    //% group="値の一時設定"
    //% block="現在のセンサー値を全項目キャッシュ"
    //% weight=80
    export function setAllTempData(): void {
        sendCommand("EJ SETALL", 200);
    }

    /**
     * すべての上書き値をリセットします。
     */
    //% group="値の一時設定"
    //% block="全上書き値をリセット"
    //% weight=70
    export function clearTempData(): void {
        sendCommand("EJ SETCLEAR", 100);
    }

    // ============================================
    // 補正オフセット
    // ============================================

    /**
     * 各種センサーの補正オフセットを設定・保存します。
     */
    //% group="補正オフセット"
    //% block="$type 補正オフセットを $value に設定"
    //% weight=60
    export function setOffset(type: OffsetType, value: number): void {
        let cmd = "";
        switch (type) {
            case OffsetType.Temp: cmd = "EJ OFFSETTEMP"; break;
            case OffsetType.Hum: cmd = "EJ OFFSETHUM"; break;
            case OffsetType.Pres: cmd = "EJ OFFSETPRES"; break;
            case OffsetType.Alt: cmd = "EJ OFFSETALT"; break;
        }
        sendCommand(cmd + " " + value.toString(), 200);
    }

    /**
     * 現在の全オフセット値を文字列で取得します。
     */
    //% group="補正オフセット"
    //% block="現在の全オフセット値を取得"
    //% weight=50
    export function getOffset(): string {
        return sendCommandWithResponse("EJ GETOFFSET", 200);
    }

    // ============================================
    // WiFi設定
    // ============================================

    /**
     * SSIDとパスワードを個別に設定し、WiFiに接続(APC)します。
     */
    //% group="WiFi設定"
    //% block="WiFiに接続 SSID:$ssid パスワード:$pwd"
    //% weight=80
    export function connectWiFi(ssid: string, pwd: string): void {
        sendCommand("EJ SETSSID " + ssid, 300);
        sendCommand("EJ SETPWD " + pwd, 300);
        sendCommand("EJ APC", 1000);
    }

    /**
     * WiFiを切断(APD)します。
     */
    //% group="WiFi設定"
    //% block="WiFiを切断"
    //% weight=70
    export function disconnectWiFi(): void {
        sendCommand("EJ APD", 500);
    }

    /**
     * WiFiの自動再接続間隔を設定します。
     */
    //% group="WiFi設定"
    //% block="WiFi自動再接続間隔を $min 分にする(0で無効)"
    //% weight=60
    export function setReconnectInterval(min: number): void {
        sendCommand("EJ RECONNECT " + min.toString(), 200);
    }

    // ============================================
    // ネットワーク情報
    // ============================================

    /**
     * WiFiが接続中か確認します。
     */
    //% group="ネットワーク情報"
    //% block="WiFi接続中？"
    //% weight=70
    export function isConnected(): boolean {
        return sendCommandWithResponse("EJ APS", 200).includes("1");
    }

    /**
     * IPアドレスを取得します。
     */
    //% group="ネットワーク情報"
    //% block="IPアドレスを取得"
    //% weight=60
    export function getIP(): string {
        return sendCommandWithResponse("EJ GETIP", 200);
    }

    /**
     * 全設定・状態を一括表示します。
     */
    //% group="ネットワーク情報"
    //% block="全設定・状態(GETCONF)を取得"
    //% weight=50
    export function getConf(): string {
        return sendCommandWithResponse("EJ GETCONF", 300);
    }

    // ============================================
    // ThingsBoard
    // ============================================

    /**
     * ThingsBoardのアクセストークンを設定します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoardトークン設定 $token"
    //% weight=50
    export function setToken(token: string): void {
        sendCommand("EJ SETTOKEN " + token, 300);
    }

    /**
     * ThingsBoardへ即時送信します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoardへ即時送信"
    //% weight=40
    export function sendTB(): void {
        sendCommand("EJ SENDTB", 1000);
    }

    /**
     * 自動送信の間隔を設定します。
     */
    //% group="ThingsBoard"
    //% block="ThingsBoard自動送信間隔を $sec 秒にする(0で停止)"
    //% weight=30
    export function autoSendTB(sec: number): void {
        sendCommand("EJ SENDTB " + sec.toString(), 200);
    }

    // ============================================
    // キュー管理
    // ============================================

    /**
     * 現在のオフラインキューの件数を取得します。
     */
    //% group="キュー管理"
    //% block="キュー件数を取得"
    //% weight=30
    export function getQueue(): string {
        return sendCommandWithResponse("EJ GETQUEUE", 200);
    }

    /**
     * キューの全データを今すぐThingsBoardに送信します。
     */
    //% group="キュー管理"
    //% block="キューを全件送信(FLUSH)"
    //% weight=20
    export function flushQueue(): void {
        sendCommand("EJ FLUSHQUEUE", 1500);
    }

    /**
     * キューを全件削除し、未送信データを破棄します。
     */
    //% group="キュー管理"
    //% block="キューを全件削除(CLEAR)"
    //% weight=10
    export function clearQueue(): void {
        sendCommand("EJ CLEARQUEUE", 300);
    }

    /**
     * キュー保存先を設定します。
     */
    //% group="キュー管理"
    //% block="キュー保存先を $store にする"
    //% weight=5
    export function setQueueStore(store: QueueStore): void {
        let cmd = store === QueueStore.LittleFS ? "LITTLEFS" : "RAM";
        sendCommand("EJ QUEUESTORE " + cmd, 500);
    }

    /**
     * キュー保存先の情報を取得します。
     */
    //% group="キュー管理"
    //% block="キュー保存先情報を取得"
    //% weight=4
    export function getQueueStore(): string {
        return sendCommandWithResponse("EJ QUEUESTORE", 200);
    }


    // ============================================
    // RTC時刻
    // ============================================

    /**
     * NTPからUTCを取得してRTCを同期します。
     */
    //% group="RTC時刻"
    //% block="NTPサーバーと時刻同期"
    //% weight=40
    export function syncTime(): void {
        sendCommand("EJ SYNCTIME", 1000);
    }

    /**
     * 現在時刻をJSTで取得します。
     */
    //% group="RTC時刻"
    //% block="現在時刻(JST)を取得"
    //% weight=30
    export function getTime(): string {
        return sendCommandWithResponse("EJ GETTIME", 200);
    }

    /**
     * 時刻をJSTで設定します(YYYY-MM-DDTHH:MM:SS 形式)。
     */
    //% group="RTC時刻"
    //% block="時刻設定 $datetime"
    //% weight=20
    export function setTime(datetime: string): void {
        sendCommand("EJ SETTIME " + datetime, 300);
    }

    // ============================================
    // LED制御
    // ============================================

    /**
     * LEDの直接制御モードを切り替えます。
     */
    //% group="LED制御"
    //% block="LED直接制御モードを $manual にする"
    //% manual.shadow="toggleOnOff"
    //% weight=40
    export function setLedMode(manual: boolean): void {
        sendCommand(manual ? "EJ LEDON" : "EJ LEDOFF", 200);
    }

    /**
     * 各色LEDのON/OFFを制御します(直接制御モード時のみ有効)。
     */
    //% group="LED制御"
    //% block="$color LEDを $on にする"
    //% on.shadow="toggleOnOff"
    //% weight=30
    export function setLedColor(color: LedColor, on: boolean): void {
        let cmd = "";
        let state = on ? "1" : "0"; // "O" (オー) になっていたため "0" に修正
        switch (color) {
            case LedColor.Red: cmd = "EJ LEDR" + state; break;
            case LedColor.Yellow: cmd = "EJ LEDY" + state; break;
            case LedColor.Blue: cmd = "EJ LEDB" + state; break;
        }
        sendCommand(cmd, 100);
    }

    // ============================================
    // OLED制御
    // ============================================

    /**
     * OLEDの直接制御モードを切り替えます。
     */
    //% group="OLED制御"
    //% block="OLED直接制御モードを $manual にする"
    //% manual.shadow="toggleOnOff"
    //% weight=50
    export function setOledMode(manual: boolean): void {
        sendCommand(manual ? "EJ OLEDON" : "EJ OLEDOFF", 200);
    }

    /**
     * OLEDの画面をクリアします。
     */
    //% group="OLED制御"
    //% block="OLED画面クリア"
    //% weight=40
    export function clearOled(): void {
        sendCommand("EJ OLEDCLEAR", 100);
    }

    /**
     * OLEDのテキスト描画位置を指定します。
     */
    //% group="OLED制御"
    //% block="OLEDカーソル移動 X:$x Y:$y"
    //% weight=30
    export function setOledCursor(x: number, y: number): void {
        sendCommand("EJ OLEDCUR " + x + "," + y, 100);
    }

    /**
     * OLEDのフォントを設定します。
     */
    //% group="OLED制御"
    //% block="OLEDフォントを $font に設定"
    //% weight=25
    export function setOledFont(font: OledFont): void {
        sendCommand("EJ OLEDFONT " + font.toString(), 100);
    }

    /**
     * 現在のOLEDのフォントを取得します。
     */
    //% group="OLED制御"
    //% block="現在のOLEDフォントを取得"
    //% weight=22
    export function getOledFont(): string {
        return sendCommandWithResponse("EJ GETFONT", 200);
    }

    /**
     * OLEDのテキストサイズを設定します(1〜4)。
     */
    //% group="OLED制御"
    //% block="OLEDテキストサイズを $size にする"
    //% size.min=1 size.max=4
    //% weight=20
    export function setOledSize(size: number): void {
        sendCommand("EJ OLEDSIZE " + size.toString(), 100);
    }

    /**
     * OLEDにテキストを描画します。
     */
    //% group="OLED制御"
    //% block="OLEDに $text を描画"
    //% weight=10
    export function printOled(text: string): void {
        sendCommand("EJ OLEDPRINT " + text, 200);
    }

    // ============================================
    // 内部通信用ヘルパー関数
    // ============================================

    function sendCommand(cmd: string, waitTime: number): void {
        serial.readString(); // 受信バッファ掃除
        serial.writeString(cmd + "\r\n");
        basic.pause(waitTime);
    }

    function sendCommandWithResponse(cmd: string, waitTime: number): string {
        serial.readString(); // 受信バッファ掃除
        serial.writeString(cmd + "\r\n");
        basic.pause(waitTime);
        let res = serial.readUntil("\n");
        return res.replace("'", "").replace("\r", "").trim();
    }
}
