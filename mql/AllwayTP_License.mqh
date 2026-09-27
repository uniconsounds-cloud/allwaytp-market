//+------------------------------------------------------------------+
//|                                           AllwayTP_License.mqh   |
//|                         Copyright 2026, AllwayTP & Versus Trade  |
//|                                           https://allwaytp.com   |
//|                  รองรับทั้ง MetaTrader 4 (MQL4) และ MetaTrader 5 (MQL5) |
//+------------------------------------------------------------------+
#property copyright "AllwayTP Marketplace"
#property link      "https://allwaytp.com"
#property strict

//+------------------------------------------------------------------+
//| CONFIGURATION                                                    |
//+------------------------------------------------------------------+
#define ALLWAYTP_API_URL "https://allwaytp-market.vercel.app/api/license/verify"

//+------------------------------------------------------------------+
//| Verify EA License with AllwayTP Cloud Server                     |
//| ส่งค่า: eaCode (เช่น "RECON_100", "RANGER_500", "DELTA_1500")      |
//| ได้รับ: true = ใช้งานได้, false = ระงับการเทรด                       |
//+------------------------------------------------------------------+
bool VerifyAllwayTPLicense(string eaCode)
{
   Print("=== [AllwayTP] Starting License Verification for: ", eaCode, " ===");
   
   // ดึงเลขที่พอร์ตและชื่อเซิร์ฟเวอร์ (รองรับทั้ง MQL4 และ MQL5)
   long accountNumber = 0;
   string brokerServer = "";

#ifdef __MQL5__
   accountNumber = AccountInfoInteger(ACCOUNT_LOGIN);
   brokerServer = AccountInfoString(ACCOUNT_SERVER);
#else
   accountNumber = (long)AccountNumber();
   brokerServer = AccountServer();
#endif
   
   // สร้าง URL สำหรับตรวจสอบสิทธิ์
   string url = ALLWAYTP_API_URL + "?account=" + IntegerToString(accountNumber) + 
                "&ea=" + eaCode + 
                "&broker=" + brokerServer + 
                "&version=1.0.0";
                
   string headers = "Content-Type: application/json\r\n";
   char postData[];
   char resultData[];
   string resultHeaders;
   int timeout = 6000; // รอ 6 วินาที
   
   ResetLastError();
   
   // ยิง WebRequest ไปยังเซิร์ฟเวอร์ AllwayTP
   int res = WebRequest("GET", url, headers, timeout, postData, resultData, resultHeaders);
   
   if(res == -1)
   {
      int err = GetLastError();
      Print("CRITICAL: [AllwayTP] WebRequest failed! Error code: ", err);
      if(err == 4060)
      {
         Alert("[AllwayTP] กรุณาเปิดใช้งาน WebRequest ใน MT4/MT5!\n" +
               "ไปที่เมนู: Tools -> Options -> แท็บ Expert Advisors\n" +
               "1. ติ๊กถูกที่ 'Allow WebRequest for listed URL'\n" +
               "2. ดับเบิ้ลคลิกเพิ่ม URL:\n" +
               "   https://allwaytp-market.vercel.app");
      }
      return false;
   }
   
   string response = CharArrayToString(resultData);
   Print("[AllwayTP] Response: ", response);
   
   // ตรวจสอบผลลัพธ์
   if(StringFind(response, "\"authorized\":true") >= 0 || StringFind(response, "\"status\":\"ACTIVE\"") >= 0)
   {
      Print("SUCCESS: [AllwayTP] License Authorized! Account: ", accountNumber);
      Comment("\n>>> AllwayTP License: [ ACTIVE ] <<<\nEA: ", eaCode, " | Account: ", accountNumber, "\nBroker: Versus Trade\n");
      return true;
   }
   else if(StringFind(response, "\"status\":\"PENDING\"") >= 0)
   {
      Alert("[AllwayTP] บัญชี ", accountNumber, " อยู่ระหว่างรอการอนุมัติสิทธิ์จากแอดมิน");
      Comment("\n>>> AllwayTP License: [ PENDING ] <<<\nรอการอนุมัติสิทธิ์จากคุณโจ้/ครูชัย\n");
      return false;
   }
   else if(StringFind(response, "\"status\":\"REVOKED\"") >= 0)
   {
      Alert("[AllwayTP] สิทธิ์การใช้งานของบัญชี ", accountNumber, " ถูกระงับ กรุณาติดต่อผู้ดูแล");
      Comment("\n>>> AllwayTP License: [ REVOKED ] <<<\nสิทธิ์ถูกระงับ กรุณาติดต่อผู้ดูแล\n");
      return false;
   }
   else if(StringFind(response, "\"status\":\"EXPIRED\"") >= 0)
   {
      Alert("[AllwayTP] สิทธิ์การใช้งานของบัญชี ", accountNumber, " หมดอายุแล้ว");
      Comment("\n>>> AllwayTP License: [ EXPIRED ] <<<\nสิทธิ์หมดอายุแล้ว\n");
      return false;
   }
   else
   {
      Alert("[AllwayTP] บัญชี ", accountNumber, " ยังไม่ได้ลงทะเบียนสิทธิ์สำหรับ EA: ", eaCode);
      Comment("\n>>> AllwayTP License: [ NOT FOUND ] <<<\nยังไม่ได้ลงทะเบียนสิทธิ์\n");
      return false;
   }
}
