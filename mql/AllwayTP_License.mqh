//+------------------------------------------------------------------+
//|                                           AllwayTP_License.mqh   |
//|                         Copyright 2026, AllwayTP & Versus Trade  |
//|                                           https://allwaytp.com   |
//|   Library ตรวจสอบสิทธิ์และส่ง Telemetry พอร์ตอัตโนมัติ (MQL4 / MQL5)  |
//|   * ครูชัยไม่ต้องแก้ไขไฟล์นี้ นำไป include และส่งรหัส EA จากตัว EA ได้เลย * |
//+------------------------------------------------------------------+
#property copyright "AllwayTP Marketplace"
#property link      "https://allwaytp.com"
#property strict

//+------------------------------------------------------------------+
//| CONFIGURATION                                                    |
//+------------------------------------------------------------------+
#define ALLWAYTP_API_URL "https://allwaytp-market.vercel.app/api/license/verify"

// ตัวแปรภายในสำหรับจัดการรอบเวลาและป้องกันการส่ง Request ชนกัน (Anti-Thundering Herd)
datetime g_allwaytp_last_check = 0;
int      g_allwaytp_interval_sec = 14400; // รอบเวลาปกติ: ทุก 4 ชั่วโมง (14,400 วินาที)
bool     g_allwaytp_is_authorized = false;
string   g_allwaytp_active_ea_code = "";

//+------------------------------------------------------------------+
//| ฟังก์ชันภายใน: คำนวณช่วงเวลาสุ่มกระจาย Request (Jitter Anti-Spike)   |
//| กระจายโหลดตามเลขพอร์ต ไม่ให้ทุกพอร์ตยิงพร้อมกันตอนต้นชั่วโมง             |
//+------------------------------------------------------------------+
int _CalculateJitterOffset(long accountNum)
{
   // กระจายเวลาตามเศษของเลขที่พอร์ต (0 - 3599 วินาที) + สุ่มเล็กน้อย (0 - 300 วินาที)
   int accountOffset = (int)(accountNum % 3600);
   int randomExtra = (int)(MathRand() % 300);
   return (accountOffset + randomExtra);
}

//+------------------------------------------------------------------+
//| ฟังก์ชันภายใน: ยิง WebRequest ส่งข้อมูล Telemetry และตรวจสิทธิ์    |
//+------------------------------------------------------------------+
bool _ExecuteLicenseCheck(string eaCode, bool isInitial)
{
   long accountNumber = 0;
   string brokerServer = "";
   double balance = 0;
   double equity = 0;
   double floatingPnl = 0;
   double freeMargin = 0;
   string currency = "USD";
   long leverage = 100;
   int openOrders = 0;

#ifdef __MQL5__
   accountNumber = AccountInfoInteger(ACCOUNT_LOGIN);
   brokerServer = AccountInfoString(ACCOUNT_SERVER);
   balance = AccountInfoDouble(ACCOUNT_BALANCE);
   equity = AccountInfoDouble(ACCOUNT_EQUITY);
   floatingPnl = AccountInfoDouble(ACCOUNT_PROFIT);
   freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   currency = AccountInfoString(ACCOUNT_CURRENCY);
   leverage = AccountInfoInteger(ACCOUNT_LEVERAGE);
   openOrders = PositionsTotal();
#else
   accountNumber = (long)AccountNumber();
   brokerServer = AccountServer();
   balance = AccountBalance();
   equity = AccountEquity();
   floatingPnl = AccountProfit();
   freeMargin = AccountFreeMargin();
   currency = AccountCurrency();
   leverage = (long)AccountLeverage();
   openOrders = OrdersTotal();
#endif

   // สร้าง URL พร้อม Telemetry ส่งขึ้นคลาวด์
   string url = ALLWAYTP_API_URL + 
                "?account=" + IntegerToString(accountNumber) + 
                "&ea=" + eaCode + 
                "&broker=" + brokerServer + 
                "&bal=" + DoubleToString(balance, 2) + 
                "&eq=" + DoubleToString(equity, 2) + 
                "&pnl=" + DoubleToString(floatingPnl, 2) + 
                "&margin=" + DoubleToString(freeMargin, 2) + 
                "&cur=" + currency + 
                "&lev=" + IntegerToString(leverage) + 
                "&orders=" + IntegerToString(openOrders) + 
                "&init=" + (isInitial ? "1" : "0") + 
                "&version=1.1.0";

   string headers = "Content-Type: application/json\r\n";
   char postData[];
   char resultData[];
   string resultHeaders;
   int timeout = 6000;

   ResetLastError();
   int res = WebRequest("GET", url, headers, timeout, postData, resultData, resultHeaders);

   if(res == -1)
   {
      int err = GetLastError();
      Print("CRITICAL: [AllwayTP] WebRequest error: ", err);
      if(err == 4060)
      {
         Alert("[AllwayTP] กรุณาเปิดใช้งาน WebRequest ใน MT4/MT5!\n" +
               "Tools -> Options -> แท็บ Expert Advisors -> ติ๊ก 'Allow WebRequest' และใส่:\n" +
               "https://allwaytp-market.vercel.app");
      }
      // หากเกิดปัญหาเน็ตหลุดชั่วคราวขณะรันอยู่แล้ว ให้ยึดสถานะเดิมไว้ก่อน ไม่ตัดสิทธิ์ทันที
      return g_allwaytp_is_authorized;
   }

   string response = CharArrayToString(resultData);

   if(StringFind(response, "\"authorized\":true") >= 0 || StringFind(response, "\"status\":\"ACTIVE\"") >= 0)
   {
      g_allwaytp_is_authorized = true;
      g_allwaytp_last_check = TimeCurrent();
      Comment("\n>>> AllwayTP License: [ ACTIVE ] <<<\nEA: ", eaCode, " | พอร์ต: ", accountNumber, 
              "\nBalance: ", DoubleToString(balance, 2), " ", currency, 
              " | Equity: ", DoubleToString(equity, 2), 
              "\nBroker: Versus Trade\n");
      return true;
   }
   else if(StringFind(response, "\"status\":\"REVOKED\"") >= 0)
   {
      g_allwaytp_is_authorized = false;
      Alert("[AllwayTP] พอร์ต ", accountNumber, " ถูกระงับสิทธิ์การใช้งานโดยแอดมิน");
      Comment("\n>>> AllwayTP License: [ REVOKED ] <<<\nสิทธิ์ถูกระงับ กรุณาติดต่อผู้ดูแล\n");
      return false;
   }
   else if(StringFind(response, "\"status\":\"PENDING\"") >= 0)
   {
      g_allwaytp_is_authorized = false;
      Alert("[AllwayTP] พอร์ต ", accountNumber, " อยู่ระหว่างรออนุมัติสิทธิ์");
      Comment("\n>>> AllwayTP License: [ PENDING ] <<<\nรอการอนุมัติสิทธิ์จากคุณโจ้/ครูชัย\n");
      return false;
   }
   else
   {
      g_allwaytp_is_authorized = false;
      Alert("[AllwayTP] พอร์ต ", accountNumber, " ยังไม่ได้ลงทะเบียนสิทธิ์สำหรับ EA: ", eaCode);
      Comment("\n>>> AllwayTP License: [ UNAUTHORIZED ] <<<\nยังไม่ได้ลงทะเบียนสิทธิ์\n");
      return false;
   }
}

//+------------------------------------------------------------------+
//| ฟังก์ชันหลัก 1: เรียกใช้ครั้งเดียวใน OnInit() ตอนเริ่มรัน EA        |
//| เช่น InitAllwayTPLicense("RECON_100")                             |
//+------------------------------------------------------------------+
bool InitAllwayTPLicense(string eaCode)
{
   g_allwaytp_active_ea_code = eaCode;
   
   long accountNum = 0;
#ifdef __MQL5__
   accountNum = AccountInfoInteger(ACCOUNT_LOGIN);
#else
   accountNum = (long)AccountNumber();
#endif

   // คำนวณช่วงเวลาสลับกระจาย (Anti-Thundering Herd)
   int jitter = _CalculateJitterOffset(accountNum);
   g_allwaytp_interval_sec = 14400 + jitter; // ~4 ชั่วโมง + สุ่มตามเลขพอร์ต

   Print("=== [AllwayTP] Initializing License for EA: ", eaCode, " (Interval: ", g_allwaytp_interval_sec, "s) ===");
   
   // ตรวจสิทธิ์ทันทีตอนเริ่มต้น
   return _ExecuteLicenseCheck(eaCode, true);
}

//+------------------------------------------------------------------+
//| ฟังก์ชันหลัก 2: เรียกใช้ใน OnTick() หรือ OnTimer() ของ EA        |
//| ทำงานแบบ Non-Blocking ไม่หน่วงการเทรด (กินเวลาเช็กเวลาเพียง 0.001ms)|
//| จะยิง Heartbeat เฉพาะเมื่อครบรอบเวลาที่กระจายไว้เท่านั้น (ทุก ~4-5 ชม.)|
//+------------------------------------------------------------------+
bool CheckAllwayTPHeartbeat(string eaCode)
{
   // ถ้ายังไม่ถึงรอบเวลา ไม่ทำอะไรเลย คืนค่าสถานะเดิมทันที (ไม่หน่วง Tick แน่นอน)
   if(TimeCurrent() - g_allwaytp_last_check < g_allwaytp_interval_sec)
   {
      return g_allwaytp_is_authorized;
   }

   // เมื่อครบรอบเวลา จึงยิงส่ง Telemetry และตรวจสิทธิ์
   Print("[AllwayTP] Triggering Periodic Heartbeat & Telemetry Update...");
   return _ExecuteLicenseCheck(eaCode, false);
}

// ฟังก์ชัน Backward-Compatible กับเวอร์ชันเดิม
bool VerifyAllwayTPLicense(string eaCode)
{
   return InitAllwayTPLicense(eaCode);
}
