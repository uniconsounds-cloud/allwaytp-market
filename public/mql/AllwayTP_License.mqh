//+------------------------------------------------------------------+
//|                                           AllwayTP_License.mqh   |
//|                         Copyright 2026, AllwayTP & Versus Trade  |
//|                                           https://allwaytp.com   |
//+------------------------------------------------------------------+
#property copyright "AllwayTP Marketplace"
#property link      "https://allwaytp.com"
#property strict

//+------------------------------------------------------------------+
//| CONFIGURATION                                                    |
//+------------------------------------------------------------------+
#define ALLWAYTP_API_URL "https://allwaytp-market.vercel.app/api/license/verify"

//+------------------------------------------------------------------+
//| Verify EA License with AllwayTP Cloud Server                    |
//| Returns: true if authorized, false if unauthorized               |
//+------------------------------------------------------------------+
bool VerifyAllwayTPLicense(string eaCode)
{
   Print("=== [AllwayTP] Starting License Verification for ", eaCode, " ===");
   
   long accountNumber = AccountInfoInteger(ACCOUNT_LOGIN);
   string brokerServer = AccountInfoString(ACCOUNT_SERVER);
   
   // Construct URL with query parameters
   string url = ALLWAYTP_API_URL + "?account=" + IntegerToString(accountNumber) + 
                "&ea=" + eaCode + 
                "&broker=" + brokerServer + 
                "&version=1.0.0";
                
   string headers = "Content-Type: application/json\r\n";
   char postData[];
   char resultData[];
   string resultHeaders;
   int timeout = 5000; // 5 seconds timeout
   
   ResetLastError();
   
   // Send WebRequest to AllwayTP Verification Server
   int res = WebRequest("GET", url, headers, timeout, postData, resultData, resultHeaders);
   
   if(res == -1)
   {
      int err = GetLastError();
      Print("CRITICAL: [AllwayTP] WebRequest failed! Error code: ", err);
      if(err == 4060)
      {
         Alert("[AllwayTP] กรุณาเปิดใช้งาน WebRequest ใน MT4/MT5!\nไปที่ Tools -> Options -> Expert Advisors -> ติ๊ก 'Allow WebRequest' และเพิ่ม URL:\nhttps://allwaytp-market.vercel.app");
      }
      return false;
   }
   
   string response = CharArrayToString(resultData);
   Print("[AllwayTP] Response: ", response);
   
   // Check if authorized
   if(StringFind(response, "\"authorized\":true") >= 0 || StringFind(response, "\"status\":\"ACTIVE\"") >= 0)
   {
      Print("SUCCESS: [AllwayTP] License Authorized! Account: ", accountNumber);
      Comment("AllwayTP License: ACTIVE | EA: ", eaCode);
      return true;
   }
   else if(StringFind(response, "\"status\":\"PENDING\"") >= 0)
   {
      Alert("[AllwayTP] บัญชี ", accountNumber, " อยู่ระหว่างรอการอนุมัติสิทธิ์จากแอดมิน");
      return false;
   }
   else if(StringFind(response, "\"status\":\"REVOKED\"") >= 0)
   {
      Alert("[AllwayTP] สิทธิ์การใช้งานของบัญชี ", accountNumber, " ถูกระงับ กรุณาติดต่อผู้ดูแล");
      return false;
   }
   else if(StringFind(response, "\"status\":\"EXPIRED\"") >= 0)
   {
      Alert("[AllwayTP] สิทธิ์การใช้งานของบัญชี ", accountNumber, " หมดอายุแล้ว");
      return false;
   }
   else
   {
      Alert("[AllwayTP] บัญชี ", accountNumber, " ยังไม่ได้ลงทะเบียนสิทธิ์สำหรับ EA ", eaCode, "\nกรุณาลงทะเบียนที่ https://allwaytp.com/register-license");
      return false;
   }
}
